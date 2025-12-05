"""
WebSocket Connection Manager for real-time chat
Manages active WebSocket connections and message broadcasting
"""
from typing import Dict, List
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for chat"""
    
    def __init__(self):
        # Maps user_id to WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and store a new WebSocket connection"""
        # Disconnect existing connection for this user if any
        if user_id in self.active_connections:
            logger.info(f"User {user_id} reconnecting, closing previous connection")
            try:
                await self.active_connections[user_id].close()
            except Exception as e:
                logger.error(f"Error closing old connection for {user_id}: {e}")
        
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send a message to a specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                logger.debug(f"Sent message to {user_id}: {message.get('type')}")
            except Exception as e:
                logger.error(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)
        else:
            logger.warning(f"Attempted to send message to disconnected user: {user_id}")
    
    async def broadcast(self, message: dict, exclude_user: str = None):
        """Broadcast a message to all connected users (optional: exclude one user)"""
        disconnected = []
        
        for user_id, connection in self.active_connections.items():
            if exclude_user and user_id == exclude_user:
                continue
                
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {user_id}: {e}")
                disconnected.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected:
            self.disconnect(user_id)
    
    def is_connected(self, user_id: str) -> bool:
        """Check if a user is currently connected"""
        return user_id in self.active_connections
    
    def get_connected_users(self) -> List[str]:
        """Get list of all connected user IDs"""
        return list(self.active_connections.keys())


# Global connection manager instance
manager = ConnectionManager()
