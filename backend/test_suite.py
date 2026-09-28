import sys
import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def run_tests():
    client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=15.0)

    print("==================================================")
    print("      AETHER COMPREHENSIVE END-TO-END TESTS       ")
    print("==================================================")

    # 1. Health check
    print("\n[1] Health Check & Mode Verification")
    health = client.get("/api/health").json()
    print(f"Status: {health['status']} | Mode: {health['mode']} | Vectors: {health['vector_memory_items']}")
    assert health["status"] == "healthy"

    # 2. Dashboard KPIs
    print("\n[2] Dashboard KPI Stats")
    stats = client.get("/api/dashboard/stats").json()
    print(f"Total Feedback: {stats['total_feedback']}")
    print(f"Active Issues: {stats['active_issues']}")
    print(f"Emerging Issues: {stats['emerging_issues']}")
    print(f"Positive: {stats['positive_percentage']}% | Negative: {stats['negative_percentage']}%")
    assert stats["total_feedback"] >= 500
    assert stats["emerging_issues"] >= 1

    # 3. Emerging Issues
    print("\n[3] Emerging Issue Detection (Explainable Trend Algorithm)")
    emerging = client.get("/api/dashboard/emerging-issues").json()
    for em in emerging[:3]:
        print(f"[EMERGING] {em['title']} | PoP Growth: +{em['growth_percentage']:.1f}% | Previous: {em['previous_mentions']} | Current: {em['current_mentions']}")
        print(f"   Severity: {em['severity']} | Channels: {', '.join(em['channels'])}")
        print(f"   Sample Quote: \"{em['sample_quote']}\"")
    assert len(emerging) > 0

    # 4. Ingest New Feedback (Demo Step 4 & 5)
    print("\n[4] Ingesting New Customer Feedback")
    demo_input = {
        "text": "The new checkout is confusing and I can't find where to enter my card.",
        "channel": "Customer Review",
        "product": "ShopApp",
        "feature": "Checkout"
    }
    fb = client.post("/api/feedback", json=demo_input).json()
    print(f"Created Feedback #{fb['id']}")
    print(f"Verbatim: \"{fb['text']}\"")
    print(f"AI Extraction -> Topic: {fb['topic']} | Sentiment: {fb['sentiment']} ({fb['sentiment_score']}) | Intent: {fb['intent']}")
    print(f"Persistent Memory Connection -> Linked Issue: {fb['issue_title']}")
    assert fb["issue_title"] == "Checkout Usability"
    assert fb["sentiment"] == "negative"

    # 5. Semantic Vector Memory Retrieval (Demo Step 6 & 7)
    print("\n[5] Vector Memory Retrieval for Ingested Feedback")
    sim = client.get(f"/api/memory/similar/{fb['id']}").json()
    print(f"Retrieved {len(sim['similar_feedback'])} semantically similar historical memories:")
    for item in sim["similar_feedback"][:3]:
        print(f"   - Match: \"{item['text']}\" ({round(item['similarity_score']*100)}% match, Channel: {item['channel']})")
    assert len(sim["similar_feedback"]) > 0

    # 6. AI Analyst Conversational Chat with Evidence (Demo Step 10, 11, 12)
    print("\n[6] AI Analyst Grounded Chat Query")
    query = "What are the biggest emerging issues?"
    chat = client.post("/api/ai/chat", json={"query": query}).json()
    print(f"Query: \"{query}\"")
    print(f"AI Grounded Answer:\n{chat['answer'][:250]}...")
    print(f"Verified Evidence Records: {len(chat['evidence'])} items")
    for ev in chat["evidence"][:2]:
        print(f"   - Evidence #{ev['id']}: \"{ev['text']}\" [{ev['channel']} | {ev['date']}]")
    assert len(chat["evidence"]) > 0

    # 7. Release Correlation Analysis
    print("\n[7] Product Release Correlation Analysis")
    releases = client.get("/api/releases").json()
    for rel in releases:
        print(f"Release: {rel['name']} ({rel['release_date'][:10]})")
        print(f"   Pre: {rel['pre_release_count']} items | Post: {rel['post_release_count']} items | Volume shift: {rel['volume_change_percentage']:+.1f}%")
        print(f"   Negative rate: {rel['negative_rate_before']}% -> {rel['negative_rate_after']}%")
        print(f"   Correlation Insight: {rel['correlation_insight']}")
    assert len(releases) > 0

    print("\n==================================================")
    print("   ALL VERIFICATIONS PASSED SUCCESSFULLY! (100%)  ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
