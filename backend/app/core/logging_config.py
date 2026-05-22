import sys
import os
from loguru import logger


def setup_logging():
    """Configure Loguru structured logging."""
    log_level = os.getenv("LOG_LEVEL", "INFO")
    log_dir = os.getenv("LOG_DIR", "/app/logs")
    environment = os.getenv("ENVIRONMENT", "production")

    # Remove default handler
    logger.remove()

    # Console handler - pretty in dev, JSON in prod
    if environment == "development":
        logger.add(
            sys.stdout,
            level=log_level,
            format=(
                "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
                "<level>{level: <8}</level> | "
                "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
                "<level>{message}</level>"
            ),
            colorize=True,
            backtrace=True,
            diagnose=True,
        )
    else:
        logger.add(
            sys.stdout,
            level=log_level,
            format=(
                '{{"time":"{time:YYYY-MM-DDTHH:mm:ss.SSSZ}",'
                '"level":"{level}",'
                '"name":"{name}",'
                '"function":"{function}",'
                '"line":{line},'
                '"message":"{message}"}}'
            ),
            colorize=False,
            backtrace=False,
            diagnose=False,
            serialize=False,
        )

    # File handler - rotating logs
    os.makedirs(log_dir, exist_ok=True)

    logger.add(
        os.path.join(log_dir, "app_{time:YYYY-MM-DD}.log"),
        level=log_level,
        rotation="00:00",  # New file at midnight
        retention="30 days",
        compression="zip",
        enqueue=True,
        backtrace=True,
        diagnose=False,
    )

    # Error-only file
    logger.add(
        os.path.join(log_dir, "error_{time:YYYY-MM-DD}.log"),
        level="ERROR",
        rotation="00:00",
        retention="90 days",
        compression="zip",
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )

    logger.info("Logging configured", level=log_level, environment=environment)
    return logger


setup_logging()
