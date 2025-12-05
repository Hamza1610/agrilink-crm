from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import SessionLocal
from app.schemas.logistics import LogisticsRequest, LogisticsResponse, LogisticsRequestUpdate
from app.crud import crud_logistics
from app.crud import crud_transaction
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=LogisticsResponse)
def request_logistics(
    logistics_request: LogisticsRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Request transport for a transaction
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Logistics request from user {current_user.id} for transaction {logistics_request.transaction_id}")

    try:
        # Verify that the user is part of the transaction
        transaction = crud_transaction.get(db, id=logistics_request.transaction_id)
        if not transaction:
            logger.warning(f"Transaction not found: {logistics_request.transaction_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        if transaction.buyer_id != current_user.id and transaction.seller_id != current_user.id:
            logger.warning(f"User {current_user.id} not authorized for transaction {transaction.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to request logistics for this transaction"
            )
        
        # Create logistics request
        logistics_data = logistics_request.dict()
        logistics_data["requester_id"] = current_user.id
        
        logistics = crud_logistics.create(db, obj_in=logistics_data)
        logger.info(f"Logistics request created: {logistics.id}")
        return logistics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error requesting logistics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{logistics_id}", response_model=LogisticsResponse)
def get_logistics(
    logistics_id: str,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get logistics request by ID
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Fetching logistics request {logistics_id} by user {current_user.id}")

    try:
        logistics = crud_logistics.get(db, id=logistics_id)
        if not logistics:
            logger.warning(f"Logistics request not found: {logistics_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logistics request not found"
            )
        
        # Verify user has access to this logistics request
        if logistics.requester_id != current_user.id:
            logger.warning(f"User {current_user.id} not authorized to access logistics {logistics_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this logistics request"
            )
        
        return logistics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching logistics request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{logistics_id}", response_model=LogisticsResponse)
def update_logistics(
    logistics_id: str,
    logistics_update: LogisticsRequestUpdate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Update logistics request status
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Updating logistics request {logistics_id} by user {current_user.id}")

    try:
        logistics = crud_logistics.get(db, id=logistics_id)
        if not logistics:
            logger.warning(f"Logistics request not found: {logistics_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logistics request not found"
            )
        
        # Verify user has permission to update
        if logistics.requester_id != current_user.id:
            logger.warning(f"User {current_user.id} not authorized to update logistics {logistics_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this logistics request"
            )
        
        # Update logistics
        updated_logistics = crud_logistics.update(db, db_obj=logistics, obj_in=logistics_update.dict(exclude_unset=True))
        logger.info(f"Logistics request updated: {logistics_id}")
        return updated_logistics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating logistics request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{logistics_id}/status")
def update_logistics_status(
    logistics_id: str,
    status: str,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Update logistics request status
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Updating logistics status {logistics_id} to {status} by user {current_user.id}")

    try:
        logistics = crud_logistics.get(db, id=logistics_id)
        if not logistics:
            logger.warning(f"Logistics request not found: {logistics_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logistics request not found"
            )
        
        # Verify user has permission to update
        if logistics.requester_id != current_user.id:
            logger.warning(f"User {current_user.id} not authorized to update logistics {logistics_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this logistics request"
            )
        
        # Update status
        logistics_data = {"status": status}
        updated_logistics = crud_logistics.update(db, db_obj=logistics, obj_in=logistics_data)
        logger.info(f"Logistics status updated: {logistics_id}")
        return updated_logistics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating logistics status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))