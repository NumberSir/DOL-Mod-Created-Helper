from loguru import logger as logger_
import sys

logger_.remove()
logger_.add(sys.stdout, format="<g>{time:HH:mm:ss}</g> | [<lvl>{level}</lvl>] | {message}", colorize=True)

logger = logger_

__all__ = ["logger"]
