"""
SafeRoute Telangana — News Module

check_news() hits Google News RSS for a given road/area name.
get_news_flags() is the schema-facing function Umaima calls per segment —
returns None or a list of relevant headline strings (fills 'news_flags').
get_route_news_advisory() is a convenience wrapper for testing multiple
segments/areas at once, kept from the original prototype.
"""

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


def check_news(road_name, max_results=5):
    query = road_name.replace(" ", "+") + "+Hyderabad+road"
    url = (
        f"https://news.google.com/rss/search?"
        f"q={query}&hl=en-IN&gl=IN&ceid=IN:en"
    )

    feed = feedparser.parse(url)

    return [
        {
            "title": e.title,
            "link": e.link,
            "published": e.published,
        }
        for e in feed.entries[:max_results]
    ]


def get_news_flags(road_name):
    """
    Returns None if no relevant news, or a list of relevant headline strings.

    This is what fills 'news_flags' in Umaima's segment JSON — call this
    once per segment's road_name.
    """

    results = check_news(road_name)

    relevant = [
        r["title"]
        for r in results
        if any(k in r["title"].lower() for k in RISK_KEYWORDS)
    ]

    return relevant if relevant else None


def get_route_news_advisory(segment_road_names):
    """
    Convenience wrapper: takes a list of road/area names along a route,
    returns per-road relevant news + a route-level reroute flag.

    Useful for local testing across a whole route at once.
    """

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


if __name__ == "__main__":
    # Test single-segment schema function
    print(get_news_flags("Khairatabad Flyover"))
    print(get_news_flags("Malakpet Road"))

    # Test multi-segment convenience wrapper
    print(
        get_route_news_advisory(
            ["Ameerpet", "Gachibowli"]
        )
    )