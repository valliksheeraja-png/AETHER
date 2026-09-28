import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.db import Base

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, default="General")
    severity = Column(String(20), nullable=False, default="medium")  # low, medium, high, critical
    status = Column(String(30), nullable=False, default="New")  # New, Emerging, Recurring, Monitoring, Resolved
    total_mentions = Column(Integer, default=0)
    first_detected = Column(DateTime, default=datetime.datetime.utcnow)
    last_detected = Column(DateTime, default=datetime.datetime.utcnow)
    trend_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    feedbacks = relationship("Feedback", back_populates="issue")
    relationships = relationship("FeedbackIssueRelationship", back_populates="issue", cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    channel = Column(String(50), nullable=False)  # Customer Review, Support Ticket, Survey, Email, Social Media, App Feedback, Interview
    customer_id = Column(String(100), nullable=True)
    product = Column(String(100), nullable=False, default="MainApp")
    feature = Column(String(100), nullable=False, default="General")
    date = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    sentiment = Column(String(20), nullable=False, default="neutral")  # positive, neutral, negative
    sentiment_score = Column(Float, nullable=False, default=0.5)
    topic = Column(String(100), nullable=False, default="General")
    product_area = Column(String(100), nullable=False, default="Core")
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True)
    severity = Column(String(20), nullable=False, default="medium")  # low, medium, high, critical
    intent = Column(String(50), nullable=False, default="complaint")  # complaint, praise, feature_request, bug_report, question
    keywords = Column(Text, nullable=True)  # JSON array of strings
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    issue = relationship("Issue", back_populates="feedbacks")
    relationships = relationship("FeedbackIssueRelationship", back_populates="feedback", cascade="all, delete-orphan")

class Release(Base):
    __tablename__ = "releases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    release_date = Column(DateTime, nullable=False)
    features = Column(Text, nullable=True)  # JSON array of strings
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FeedbackIssueRelationship(Base):
    __tablename__ = "feedback_issue_relationships"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedbacks.id"), nullable=False)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    similarity_score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    feedback = relationship("Feedback", back_populates="relationships")
    issue = relationship("Issue", back_populates="relationships")
