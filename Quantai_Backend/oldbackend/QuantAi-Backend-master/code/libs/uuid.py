import uuid

def Get10DigitUUIDHex(*args, **kwargs):
    return uuid.uuid4().hex.upper()[:10]

def Get20DigitUUIDHex(*args, **kwargs):
    return uuid.uuid4().hex.upper()[:20]