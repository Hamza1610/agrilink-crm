"""
AI Agent Service for processing user queries using Multi-Agent System with LangGraph
"""
from typing import Optional
from app.models.user import User


class AIAgent:
    """
    AI Agent that processes user queries and provides intelligent responses using a Multi-Agent System
    """
    
    def __init__(self):
        from app.agents import create_agent_graph
        try:
            self.graph = create_agent_graph()
        except Exception as e:
            print(f"Error initializing agent graph: {e}")
            self.graph = None
    
    async def process_query(self, query: str, user: Optional[User] = None):
        """
        Process a user query and return an appropriate response (async with timeout)
        """
        if not self.graph:
            return "System is currently initializing or missing configuration (GROQ_API_KEY). Please try again later."

        from langchain_core.messages import HumanMessage
        import asyncio
        
        # Prepare initial state
        initial_state = {
            "messages": [HumanMessage(content=query)],
            "next": "",
            "user_id": user.id if user else "anonymous",
            "user_info": {
                "phone": user.phone_number if user else None,
                "name": user.village if user else None,
                "type": user.user_type if user else None
            }
        }
        

        print("TRACING DATAFLOW: INITIAL STATE", initial_state)
        try:
            # Run the synchronous invoke in a thread pool with timeout protection
            loop = asyncio.get_event_loop()
            
            # Wrap invoke in a lambda for executor
            def invoke_graph():
                print("DEBUG: Starting graph.invoke()")
                try:
                    result = self.graph.invoke(
                        initial_state,
                        config={"recursion_limit": 50}
                    )
                    print("DEBUG: graph.invoke() completed successfully")
                    return result
                except Exception as e:
                    print(f"DEBUG: graph.invoke() raised exception: {e}")
                    raise
            
            # Execute with 30 second timeout
            try:
                result = await asyncio.wait_for(
                    loop.run_in_executor(None, invoke_graph),
                    timeout=30.0
                )
            except asyncio.TimeoutError:
                error_msg = "The AI agent is taking too long to process your request (timeout after 30s). This might be due to a complex query or system issue. Please try a simpler question or try again later."
                print(f"ERROR: {error_msg}")
                return error_msg
            
            # Extract the last message content
            messages = result.get("messages", [])
            if messages:
                last_message = messages[-1]
                # Handle both AIMessage and ToolMessage
                if hasattr(last_message, 'content'):
                    return last_message.content
                else:
                    return str(last_message)
            else:
                return "I processed your request but didn't generate a response."
                
        except Exception as e:
            print(f"Error processing query with agent graph: {e}")
            import traceback
            traceback.print_exc()
            return f"I encountered an error while processing your request. Please try again or rephrase your question."