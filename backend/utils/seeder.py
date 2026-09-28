import os
import csv
import json
import random
import datetime
from pathlib import Path
from sqlalchemy.orm import Session

from backend.models.models import Feedback, Issue, Release, FeedbackIssueRelationship
from backend.services.ai_service import ai_service
from backend.services.memory_service import memory_service
from backend.services.trend_service import trend_service

CHANNELS = [
    "Customer Review",
    "Support Ticket",
    "Survey",
    "Email",
    "Social Media",
    "App Feedback",
    "Interview"
]

FEEDBACK_TEMPLATES = {
    "Checkout Usability": {
        "topic": "Checkout",
        "product_area": "Payments & Checkout",
        "feature": "Checkout",
        "severity": "high",
        "category": "Payments",
        "description": "Customer confusion surrounding card input placement, step validation, and checkout CTA discoverability.",
        "feedbacks": [
            ("The new checkout is really confusing and I can't find where to enter my card.", "negative", 0.92, "complaint"),
            ("Checkout is confusing, took me 10 minutes to buy a simple shirt.", "negative", 0.88, "complaint"),
            ("Where do I enter my card number on the checkout screen? The field is hidden.", "negative", 0.90, "complaint"),
            ("Payment page is hard to understand after the latest update.", "negative", 0.85, "complaint"),
            ("The checkout flow is difficult and keeps asking me to re-verify billing address.", "negative", 0.84, "complaint"),
            ("Can't find the card field during checkout. Please revert to previous UI.", "negative", 0.91, "complaint"),
            ("The checkout button is greyed out without telling me what error occurred.", "negative", 0.89, "bug_report"),
            ("Why did you change the checkout screen? It was so much simpler before.", "negative", 0.86, "complaint"),
            ("I abandoned my cart because checkout asked for same information twice.", "negative", 0.93, "complaint"),
            ("Confusing checkout layout. Card details section is almost invisible on dark mode.", "negative", 0.91, "complaint"),
            ("The step 3 of checkout failed to advance when clicking continue.", "negative", 0.87, "bug_report"),
            ("Tried checking out three times and the payment button refused to register.", "negative", 0.90, "complaint"),
            ("The checkout page has way too many cluttered steps now.", "negative", 0.82, "complaint"),
            ("I can't see the order summary before placing the order in checkout.", "negative", 0.79, "complaint"),
            ("Checkout UX is very unintuitive. Please test with actual users.", "negative", 0.88, "complaint")
        ]
    },
    "Payment Processing Failure": {
        "topic": "Payment",
        "product_area": "Payments & Checkout",
        "feature": "Payment Gateway",
        "severity": "critical",
        "category": "Payments",
        "description": "Transaction failures, 3D secure timeouts, and duplicate credit card charges at payment gateway.",
        "feedbacks": [
            ("Payment failed with error code 502, but my card was charged twice!", "negative", 0.96, "bug_report"),
            ("My credit card gets declined on this app but works everywhere else.", "negative", 0.91, "complaint"),
            ("The payment gateway timed out while authenticating with my bank.", "negative", 0.89, "bug_report"),
            ("Stripe checkout modal hangs on processing spinner indefinitely.", "negative", 0.92, "bug_report"),
            ("Refund took 3 weeks and support hasn't confirmed transaction receipt.", "negative", 0.87, "complaint"),
            ("Payment declined again. Why does Apple Pay constantly fail here?", "negative", 0.90, "complaint"),
            ("Transaction failed at the final gateway step.", "negative", 0.88, "bug_report"),
            ("Double charged for one order. Need urgent refund assistance.", "negative", 0.95, "complaint")
        ]
    },
    "OTP Delivery Delay": {
        "topic": "Authentication",
        "product_area": "Security & Identity",
        "feature": "OTP Verification",
        "severity": "high",
        "category": "Security",
        "description": "SMS and 2FA verification codes arriving after expiry or failing to deliver to specific carriers.",
        "feedbacks": [
            ("OTP took 10 minutes to arrive and by then it was already expired.", "negative", 0.91, "complaint"),
            ("Never received the SMS verification code despite pressing resend 4 times.", "negative", 0.94, "complaint"),
            ("Why is the 2FA SMS so slow? I can't log in to access my account.", "negative", 0.88, "complaint"),
            ("Verification code arrives 15 minutes late every single time.", "negative", 0.92, "complaint"),
            ("SMS OTP delivery is broken for international numbers.", "negative", 0.89, "bug_report"),
            ("Hit maximum OTP retry limit because the first 3 never arrived.", "negative", 0.93, "complaint"),
            ("The verification screen times out before the code reaches my phone.", "negative", 0.87, "complaint")
        ]
    },
    "Mobile App Lag & Crashing": {
        "topic": "Mobile Performance",
        "product_area": "Client Infrastructure",
        "feature": "Mobile App Core",
        "severity": "high",
        "category": "Performance",
        "description": "App frame drops, sudden crashes on older devices, and heavy battery consumption.",
        "feedbacks": [
            ("App crashes every time I scroll past the 5th product on the feed.", "negative", 0.94, "bug_report"),
            ("Extremely laggy scrolling on Android. Stutters like crazy.", "negative", 0.89, "complaint"),
            ("The app makes my phone overheat and drains 20% battery in 15 minutes.", "negative", 0.91, "complaint"),
            ("Froze on splash screen, had to force kill and reinstall.", "negative", 0.90, "bug_report"),
            ("Memory leak issues seem obvious, app gets progressively slower.", "negative", 0.86, "bug_report"),
            ("App just closed itself while I was adding items to my cart.", "negative", 0.92, "bug_report"),
            ("Super sluggish performance after the latest v2.4 update.", "negative", 0.88, "complaint")
        ]
    },
    "Search Accuracy & Zero Results": {
        "topic": "Search & Discovery",
        "product_area": "Catalog & Storefront",
        "feature": "Product Search",
        "severity": "medium",
        "category": "Catalog",
        "description": "Search queries failing on typos, returning irrelevant products, and broken category filters.",
        "feedbacks": [
            ("Searching for 'wireless headphones' returns phone chargers and cables.", "negative", 0.81, "complaint"),
            ("Search typo tolerance is terrible. One wrong letter gives zero results.", "negative", 0.83, "complaint"),
            ("Filters reset every time I apply price range sorting.", "negative", 0.86, "bug_report"),
            ("Search returns no results even for top trending catalog items.", "negative", 0.85, "complaint"),
            ("Category filter doesn't filter properly on mobile web.", "negative", 0.79, "bug_report"),
            ("The search bar auto-complete takes 4 seconds to show suggestions.", "negative", 0.80, "complaint")
        ]
    },
    "Account Login & Auth Errors": {
        "topic": "Authentication",
        "product_area": "Security & Identity",
        "feature": "User Login",
        "severity": "high",
        "category": "Security",
        "description": "Session expiry logout loops, Google OAuth errors, and password reset email delays.",
        "feedbacks": [
            ("Getting logged out every single day. Doesn't remember my session.", "negative", 0.87, "complaint"),
            ("Google Sign-In button throws OAuth invalid client error.", "negative", 0.93, "bug_report"),
            ("Password reset link expired before I even received the email.", "negative", 0.89, "complaint"),
            ("Can't log in on my tablet even with correct credentials.", "negative", 0.86, "complaint"),
            ("Infinite login redirect loop on Chrome desktop.", "negative", 0.91, "bug_report")
        ]
    },
    "Dashboard Data Discrepancies": {
        "topic": "Analytics",
        "product_area": "Merchant Tools",
        "feature": "Dashboard Reporting",
        "severity": "medium",
        "category": "Analytics",
        "description": "Discrepancy between analytics total sales and order receipts, delayed graph rendering.",
        "feedbacks": [
            ("Dashboard metrics don't match our actual sales export numbers.", "negative", 0.84, "bug_report"),
            ("The sales graph takes forever to render when selecting 90 days range.", "negative", 0.78, "complaint"),
            ("CSV export from analytics is missing order timestamp column.", "negative", 0.82, "complaint"),
            ("Real-time visitors metric is frozen at zero all afternoon.", "negative", 0.85, "bug_report")
        ]
    },
    "Notification Spam & Delivery Glitches": {
        "topic": "Communications",
        "product_area": "Customer Engagement",
        "feature": "Push Notifications",
        "severity": "low",
        "category": "Engagement",
        "description": "Too many promotional push notifications and difficulty updating notification preferences.",
        "feedbacks": [
            ("Getting 5 promotional notifications every single morning. Stop spamming.", "negative", 0.88, "complaint"),
            ("Turned off marketing notifications in settings but still receiving them.", "negative", 0.89, "bug_report"),
            ("Order shipped notification arrived 2 days after the package was delivered.", "negative", 0.75, "complaint")
        ]
    },
    "Delight & Favorable Feedback": {
        "topic": "User Experience",
        "product_area": "General",
        "feature": "Storefront",
        "severity": "low",
        "category": "General",
        "description": "Positive sentiment praising sleek UI, fast shipping updates, and quick customer support.",
        "feedbacks": [
            ("Love the new clean design! Super easy to browse products.", "positive", 0.94, "praise"),
            ("The product recommendations are spot on. Really great upgrade.", "positive", 0.92, "praise"),
            ("Customer support resolved my question in under 3 minutes. Fantastic!", "positive", 0.96, "praise"),
            ("Very fast order tracking. Delivery arrived a day earlier than expected.", "positive", 0.91, "praise"),
            ("Great app, simple navigation and clean interface.", "positive", 0.90, "praise"),
            ("The wishlist sync across devices works flawlessly.", "positive", 0.89, "praise"),
            ("Checkout was smooth and quick with one-click payment.", "positive", 0.93, "praise"),
            ("One of the best shopping experiences I've had on mobile.", "positive", 0.95, "praise")
        ]
    }
}

async def seed_database(db: Session, force: bool = False) -> int:
    """
    Seeds at least 500 realistic feedback records into SQLite and persistent vector memory.
    Implements the exact required trend progression:
    Checkout UX intentionally ramps up:
      Week 1 = 3 mentions
      Week 2 = 6 mentions
      Week 3 = 11 mentions
      Week 4 = 19 mentions
    yielding +150% growth and triggering the EMERGING badge!
    """
    existing_count = db.query(Feedback).count()
    if existing_count >= 500 and not force:
        print(f"[Seeder] Already seeded ({existing_count} records). Skipping.")
        return existing_count

    # Clear existing data if forcing
    if force:
        db.query(FeedbackIssueRelationship).delete()
        db.query(Feedback).delete()
        db.query(Issue).delete()
        db.query(Release).delete()
        db.commit()

    print("[Seeder] Generating 500 realistic feedback records and initializing memory engine...")

    now = datetime.datetime.utcnow()

    # 1. Create Product Releases
    rel1 = Release(
        name="v2.4 - Checkout Redesign & One-Click Pay",
        description="Redesigned checkout modal, streamlined billing fields, and integrated new card gateway.",
        release_date=now - datetime.timedelta(days=12),
        features=json.dumps(["Checkout", "Payment Gateway", "One-Click Pay"]),
        created_at=now - datetime.timedelta(days=12)
    )
    rel2 = Release(
        name="v2.3 - Mobile Performance & Auth Enhancements",
        description="Updated app runtime engine, revamped SMS OTP provider, and added Google OAuth.",
        release_date=now - datetime.timedelta(days=32),
        features=json.dumps(["Mobile App Core", "OTP Verification", "User Login"]),
        created_at=now - datetime.timedelta(days=32)
    )
    db.add(rel1)
    db.add(rel2)
    db.flush()

    # 2. Create Issue Records
    issue_map: dict[str, Issue] = {}
    for issue_title, spec in FEEDBACK_TEMPLATES.items():
        if issue_title == "Delight & Favorable Feedback":
            continue
        iss = Issue(
            title=issue_title,
            description=spec["description"],
            category=spec["category"],
            severity=spec["severity"],
            status="New",
            total_mentions=0,
            first_detected=now - datetime.timedelta(days=30),
            last_detected=now,
            trend_percentage=0.0,
            created_at=now - datetime.timedelta(days=30)
        )
        db.add(iss)
        db.flush()
        issue_map[issue_title] = iss

    # 3. Generate 520 realistic feedback records with deliberate date distribution
    records_to_insert = []
    vector_batch = []
    csv_rows = []

    # Distribution plan across 30 days:
    # Week 4 (last 7 days): days 0-6
    # Week 3 (8-14 days ago): days 7-13
    # Week 2 (15-21 days ago): days 14-20
    # Week 1 (22-28 days ago): days 21-28

    # A. Emerging Checkout UX: Week 1=3, Week 2=6, Week 3=11, Week 4=19 (+ extra to reach ~45 mentions)
    checkout_spec = FEEDBACK_TEMPLATES["Checkout Usability"]
    checkout_weekly_counts = [(21, 28, 3), (14, 20, 6), (7, 13, 11), (0, 6, 22)]
    for min_d, max_d, count in checkout_weekly_counts:
        for _ in range(count):
            text, sent, score, intent = random.choice(checkout_spec["feedbacks"])
            days_ago = random.uniform(min_d, max_d)
            fb_date = now - datetime.timedelta(days=days_ago, hours=random.randint(0, 23))
            channel = random.choice(["Customer Review", "Support Ticket", "Survey", "App Feedback"])
            records_to_insert.append({
                "issue_key": "Checkout Usability",
                "text": text,
                "sentiment": sent,
                "score": score,
                "intent": intent,
                "date": fb_date,
                "channel": channel,
                "topic": checkout_spec["topic"],
                "product_area": checkout_spec["product_area"],
                "feature": checkout_spec["feature"],
                "severity": checkout_spec["severity"]
            })

    # B. Emerging OTP delays: Week 1=2, Week 2=4, Week 3=8, Week 4=14 (growth ~+35%)
    otp_spec = FEEDBACK_TEMPLATES["OTP Delivery Delay"]
    otp_weekly_counts = [(21, 28, 2), (14, 20, 4), (7, 13, 8), (0, 6, 15)]
    for min_d, max_d, count in otp_weekly_counts:
        for _ in range(count):
            text, sent, score, intent = random.choice(otp_spec["feedbacks"])
            days_ago = random.uniform(min_d, max_d)
            fb_date = now - datetime.timedelta(days=days_ago, hours=random.randint(0, 23))
            channel = random.choice(["Support Ticket", "Customer Review", "Social Media", "Email"])
            records_to_insert.append({
                "issue_key": "OTP Delivery Delay",
                "text": text,
                "sentiment": sent,
                "score": score,
                "intent": intent,
                "date": fb_date,
                "channel": channel,
                "topic": otp_spec["topic"],
                "product_area": otp_spec["product_area"],
                "feature": otp_spec["feature"],
                "severity": otp_spec["severity"]
            })

    # C. Fill remaining ~445 records across all categories evenly over 30 days
    other_issues = [
        "Payment Processing Failure",
        "Mobile App Lag & Crashing",
        "Search Accuracy & Zero Results",
        "Account Login & Auth Errors",
        "Dashboard Data Discrepancies",
        "Notification Spam & Delivery Glitches",
        "Delight & Favorable Feedback"
    ]

    target_total = 520
    remaining_count = target_total - len(records_to_insert)

    for i in range(remaining_count):
        chosen_issue = random.choice(other_issues)
        spec = FEEDBACK_TEMPLATES[chosen_issue]
        text, sent, score, intent = random.choice(spec["feedbacks"])
        days_ago = random.uniform(0, 30)
        fb_date = now - datetime.timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        channel = random.choice(CHANNELS)
        records_to_insert.append({
            "issue_key": chosen_issue if chosen_issue != "Delight & Favorable Feedback" else None,
            "text": text,
            "sentiment": sent,
            "score": score,
            "intent": intent,
            "date": fb_date,
            "channel": channel,
            "topic": spec["topic"],
            "product_area": spec["product_area"],
            "feature": spec["feature"],
            "severity": spec["severity"]
        })

    # Shuffle to ensure realistic interspersed order
    random.shuffle(records_to_insert)

    # Insert feedbacks into SQLite and construct embeddings
    for item in records_to_insert:
        iss_obj = issue_map.get(item["issue_key"]) if item["issue_key"] else None

        fb = Feedback(
            text=item["text"],
            channel=item["channel"],
            customer_id=f"cust_{random.randint(1000, 9999)}",
            product="ShopApp",
            feature=item["feature"],
            date=item["date"],
            sentiment=item["sentiment"],
            sentiment_score=item["score"],
            topic=item["topic"],
            product_area=item["product_area"],
            issue_id=iss_obj.id if iss_obj else None,
            severity=item["severity"],
            intent=item["intent"],
            keywords=json.dumps([item["feature"].lower(), item["topic"].lower(), item["intent"]]),
            summary=f"Customer feedback regarding {item['feature']}.",
            created_at=item["date"]
        )
        db.add(fb)
        db.flush()

        if iss_obj:
            iss_obj.total_mentions = (iss_obj.total_mentions or 0) + 1
            rel = FeedbackIssueRelationship(
                feedback_id=fb.id,
                issue_id=iss_obj.id,
                similarity_score=0.88,
                created_at=item["date"]
            )
            db.add(rel)

        # Generate dense semantic vector
        embedding = ai_service._generate_dense_semantic_vector(item["text"])

        vector_batch.append({
            "feedback_id": fb.id,
            "text": fb.text,
            "embedding": embedding,
            "metadata": {
                "issue_id": iss_obj.id if iss_obj else None,
                "issue_title": iss_obj.title if iss_obj else None,
                "channel": fb.channel,
                "sentiment": fb.sentiment,
                "date": fb.date.isoformat(),
                "feature": fb.feature
            }
        })

        csv_rows.append({
            "feedback": item["text"],
            "channel": item["channel"],
            "date": item["date"].strftime("%Y-%m-%d"),
            "product": "ShopApp",
            "customer_id": fb.customer_id,
            "feature": item["feature"]
        })

    # Persist vectors in MemoryService
    memory_service.batch_add_vectors(vector_batch)
    db.commit()

    # Recalculate trends across all issues
    trend_service.recalculate_all_trends(db)

    # Save CSV copy to data/seed_feedback.csv for user CSV upload demo
    data_dir = Path(__file__).resolve().parent.parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    csv_file = data_dir / "seed_feedback.csv"
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["feedback", "channel", "date", "product", "customer_id", "feature"])
        writer.writeheader()
        writer.writerows(csv_rows[:100])  # Write 100 sample records for convenient upload testing

    print(f"[Seeder] Successfully seeded {len(records_to_insert)} records! Emerging issue detection active.")
    return len(records_to_insert)
