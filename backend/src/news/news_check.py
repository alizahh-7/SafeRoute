#backend/src/news/news_check.py
"""
SafeRoute Telangana — News Module

get_news_flags() is the schema-facing function Umaima calls per segment —
returns None or a list of relevant headline strings (fills news_flags).

get_news_flags_weighted() is a richer bonus layer (urgency + recency scoring)
for the frontend/report — NOT wired into the frozen schema without her sign-off.
"""

from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import feedparser
import requests


RISK_KEYWORDS = [
    "flood",
    "accident",
    "closure",
    "diversion",
    "traffic",
    "killed",
    "injured",
    "collapse",
]

HIGH_URGENCY_KEYWORDS = [
    "accident",
    "flood",
    "killed",
    "injured",
    "collapse",
    "closure",
]

LOW_URGENCY_KEYWORDS = [
    "diversion",
    "roadwork",
    "traffic",
    "maintenance",
    "review",
]
_news_cache = {}
_raw_cache = {}


def _get_raw_results(road_name):
    if road_name not in _raw_cache:
        _raw_cache[road_name] = check_news(road_name)
    return _raw_cache[road_name]


def check_news(road_name, max_results=12):
    params = {"q": f'"{road_name}" Hyderabad road', "hl": "en-IN", "gl": "IN", "ceid": "IN:en"}
    try:
        response = requests.get("https://news.google.com/rss/search", params=params, headers={"User-Agent": "SafeRouteTelangana/1.0"}, timeout=8)
        response.raise_for_status()
        feed = feedparser.parse(response.content)
    except requests.exceptions.RequestException:
        return []

    return [
        {
            "title": entry.title,
            "link": entry.link,
            "published": entry.published,
        }
        for entry in feed.entries[:max_results]
    ]


def _road_terms(road_name):
    ignored = {"road", "street", "lane", "flyover", "junction", "highway", "the", "and"}
    return [term.lower() for term in road_name.replace("-", " ").split() if len(term) >= 4 and term.lower() not in ignored]


def _is_road_relevant(title, road_name):
    title = title.lower()
    terms = _road_terms(road_name)
    return bool(terms) and any(term in title for term in terms)


def get_news_flags(road_name):
    """
    Schema-facing function.

    Returns:
        None or a list of relevant headline strings.
    """
    if road_name in _news_cache:
        return _news_cache[road_name]
    results = _get_raw_results(road_name)
    relevant = [
        result["title"]
        for result in results
        if _is_road_relevant(result["title"], road_name)
        and any(keyword in result["title"].lower() for keyword in RISK_KEYWORDS)
    ]
    flags = relevant if relevant else None
    _news_cache[road_name] = flags
    return flags


REROUTE_THRESHOLD = 0.5  # high-urgency + still-recent news only


def get_route_news_advisory(segment_road_names):
    """Convenience wrapper for testing multiple road names/segments at once."""
    advisory = {}
    reroute_flag = False

    for road_name in segment_road_names:
        flags = get_news_flags(road_name)

        advisory[road_name] = flags

        if news_risk_score(road_name) >= REROUTE_THRESHOLD:
            reroute_flag = True

    return {
        "segments": advisory,
        "should_prompt_reroute": reroute_flag,
    }


def classify_urgency(headline):
    headline_lower = headline.lower()

    if any(
        keyword in headline_lower
        for keyword in HIGH_URGENCY_KEYWORDS
    ):
        return "high"

    if any(
        keyword in headline_lower
        for keyword in LOW_URGENCY_KEYWORDS
    ):
        return "low"

    return "medium"


def recency_weight(published_str, half_life_hours=24):
    """
    1.0 = very recent, decaying toward 0 as news ages
    (halves every half_life_hours).
    """
    try:
        published_time = parsedate_to_datetime(published_str)

        age_hours = (
            datetime.now(timezone.utc) - published_time
        ).total_seconds() / 3600

        return round(
            0.5 ** (age_hours / half_life_hours),
            3,
        )

    except Exception:
        return 0.5


def get_news_flags_weighted(road_name):
    """
    BONUS layer (not schema-frozen):
    urgency + recency scoring, sorted by relevance-right-now.

    Use for frontend display/report,
    not as Umaima's news_flags input unless she approves
    the schema change.
    """
    results = _get_raw_results(road_name)

    relevant = []

    for result in results:
        if _is_road_relevant(result["title"], road_name) and any(
            keyword in result["title"].lower()
            for keyword in RISK_KEYWORDS
        ):
            relevant.append(
                {
                    "headline": result["title"],
                    "urgency": classify_urgency(result["title"]),
                    "recency_weight": recency_weight(
                        result["published"]
                    ),
                    "published": result["published"],
                }
            )

    relevant.sort(
        key=lambda item: item["recency_weight"],
        reverse=True,
    )

    return relevant if relevant else None


if __name__ == "__main__":
    print(get_news_flags("Khairatabad Flyover"))

    print(
        get_route_news_advisory(
            ["Ameerpet", "Gachibowli"]
        )
    )

    print(
        get_news_flags_weighted(
            "Khairatabad Flyover"
        )
    )
    
    
URGENCY_WEIGHT = {"high": 1.0, "medium": 0.6, "low": 0.3}


def news_risk_score(road_name):
    """Numeric news risk in [0,1] — for fusion."""
    weighted = get_news_flags_weighted(road_name)
    if not weighted:
        return 0.0
    return max(
        URGENCY_WEIGHT.get(item["urgency"], 0.3) * item["recency_weight"]
        for item in weighted
    )
