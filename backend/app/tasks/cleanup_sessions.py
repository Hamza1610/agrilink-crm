"""
Background task to cleanup inactive chat sessions (7+ days)
Run this periodically using a task scheduler (cron, celery, etc.)
"""
from datetime import datetime, timedelta
from app.db.session import SessionLocal
from app.models.conversation import ChatSession
import logging

logger = logging.getLogger(__name__)


def cleanup_inactive_sessions(days_inactive: int = 7):
    """
    Delete chat sessions that haven't been active for the specified number of days
    
    Args:
        days_inactive: Number of days of inactivity before deletion (default: 7)
    """
    db = SessionLocal()
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_inactive)
        
        # Find inactive sessions
        inactive_sessions = db.query(ChatSession).filter(
            ChatSession.is_web_chat == True,
            ChatSession.last_activity < cutoff_date
        ).all()
        
        count = len(inactive_sessions)
        
        if count > 0:
            logger.info(f"Found {count} inactive sessions to delete (older than {days_inactive} days)")
            
            # Delete inactive sessions
            for session in inactive_sessions:
                db.delete(session)
            
            db.commit()
            logger.info(f"Successfully deleted {count} inactive chat sessions")
        else:
            logger.info("No inactive sessions found to delete")
        
        return count
        
    except Exception as e:
        logger.error(f"Error cleaning up inactive sessions: {e}", exc_info=True)
        db.rollback()
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    # Can be run directly or scheduled
    cleanup_inactive_sessions()
