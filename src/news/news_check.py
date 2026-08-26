@'
"""
SafeRoute Telangana — News Module
Checks Google News RSS for recent road-related news per area,
and flags whether a reroute prompt should be shown.
"""
import feedparser

RISK_KEYWORDS = ["flood", "accident", "closure", "diversion", "traffic", "killed", "injured", "collapse"]

def check_news(area_name, max_results=5):
    query = area_name.replace(" ", "+") + "+road"
    url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
    feed = feedparser.parse(url)
    return [{"title": e.title, "link": e.link, "published": e.published} for e in feed.entries[:max_results]]

def get_route_news_advisory(segment_areas):
    """
    segment_areas: list of area names along a route
    Returns per-area relevant news + a route-level reroute flag
    """
    advisory = {}
    reroute_flag = False

    for area in segment_areas:
        results = check_news(area)
        relevant = [r for r in results if any(k in r["title"].lower() for k in RISK_KEYWORDS)]
        advisory[area] = relevant
        if relevant:
            reroute_flag = True

    return {"segments": advisory, "should_prompt_reroute": reroute_flag}

if __name__ == "__main__":
    output = get_route_news_advisory(["Ameerpet", "Gachibowli"])
    print(output)
'@ | Out-File -FilePath src\news\news_check.py -Encoding utf8