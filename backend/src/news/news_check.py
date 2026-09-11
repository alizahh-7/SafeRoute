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


def check_news(road_name, max_results=5):
    query = road_name.replace(" ", "+") + "+Hyderabad+road"

    url = (
        "https://news.google.com/rss/search"
        f"?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
    )

    feed = feedparser.parse(url)

    return [
        {
            "title": entry.title,
            "link": entry.link,
            "published": entry.published,
        }
        for entry in feed.entries[:max_results]
    ]


def get_news_flags(road_name):
    """
    Schema-facing function.

    Returns:
        None or a list of relevant headline strings.
    """
    results = check_news(road_name)
    # Use the first meaningful word of the road name to confirm relevance
    # (e.g. "Khairatabad" from "Khairatabad Flyover")
    road_keyword = road_name.split()[0].lower()

    relevant = [
        result["title"]
        for result in results
        if road_keyword in result["title"].lower()
        and any(keyword in result["title"].lower() for keyword in RISK_KEYWORDS)
    ]

    return relevant if relevant else None


def get_route_news_advisory(segment_road_names):
    """Convenience wrapper for testing multiple road names/segments at once."""
    advisory = {}
    reroute_flag = False

    for road_name in segment_road_names:
        flags = get_news_flags(road_name)

        advisory[road_name] = flags

        if flags:
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
    results = check_news(road_name)

    relevant = []

    for result in results:
        if any(
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