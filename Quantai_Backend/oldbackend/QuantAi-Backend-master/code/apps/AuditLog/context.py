import contextlib
import threading
import time
from functools import partial

from django.contrib.auth import get_user_model
from django.db.models.signals import pre_save

from apps.AuditLog.models import LogEntry

threadlocal = threading.local()

def getDeviceType(user_agent):
    if user_agent.is_mobile == True:
        return "mobile"
    if user_agent.is_tablet == True:
        return "tablet"
    if user_agent.is_touch_capable == True:
        return "touch_capable"
    if user_agent.is_pc == True:
        return "pc"
    if user_agent.is_bot == True:
        return "bot"
    return None

@contextlib.contextmanager
def set_actor(actor, remote_addr=None , geo_data=None, user_agent=None):
    """Connect a signal receiver with current user attached."""
    # Initialize thread local storage
    print (user_agent)
    threadlocal.auditlog = {
        "signal_duid": ("set_actor", time.time()),
        "remote_addr": remote_addr,
        "geo_data": geo_data,
        "user_agent_data" : {
            "browser" : {
                "family" : user_agent.browser.family,
                "version" : user_agent.browser.version_string,
            },
            "os" : {
                "family" : user_agent.os.family,
                "version" : user_agent.os.version_string,
            },
            "device_type" : getDeviceType(user_agent),
        }
    }

    # Connect signal for automatic logging
    set_actor = partial(
        _set_actor, user=actor, signal_duid=threadlocal.auditlog["signal_duid"]
    )
    pre_save.connect(
        set_actor,
        sender=LogEntry,
        dispatch_uid=threadlocal.auditlog["signal_duid"],
        weak=False,
    )

    try:
        yield
    finally:
        try:
            auditlog = threadlocal.auditlog
        except AttributeError:
            pass
        else:
            pre_save.disconnect(sender=LogEntry, dispatch_uid=auditlog["signal_duid"])
            del threadlocal.auditlog


def _set_actor(user, sender, instance, signal_duid, **kwargs):
    """Signal receiver with extra 'user' and 'signal_duid' kwargs.

    This function becomes a valid signal receiver when it is curried with the actor and a dispatch id.
    """
    try:
        auditlog = threadlocal.auditlog
    except AttributeError:
        pass
    else:
        if signal_duid != auditlog["signal_duid"]:
            return
        auth_user_model = get_user_model()
        if (
            sender == LogEntry
            and isinstance(user, auth_user_model)
            and instance.actor is None
        ):
            instance.actor = user

        instance.remote_addr = auditlog["remote_addr"]
        instance.geo_data = auditlog["geo_data"]
        instance.user_agent_data = auditlog["user_agent_data"]


@contextlib.contextmanager
def disable_auditlog():
    threadlocal.auditlog_disabled = True
    try:
        yield
    finally:
        try:
            del threadlocal.auditlog_disabled
        except AttributeError:
            pass
