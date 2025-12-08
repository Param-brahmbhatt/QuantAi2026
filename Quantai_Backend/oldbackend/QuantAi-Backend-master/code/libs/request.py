from django.http import QueryDict

def RequestDataMultiplier(data, files):
    '''
    This function is return to merge file and data part
    incase there is multipart data.
    we are doing this just b'cos DRF serializers doesn't have anything
    like normal form to pass files. but mergin both works
    '''
    
    if type(data) == dict:
        copydata = QueryDict('', mutable=True)
        copydata.update(data)
    else:
        copydata = data.copy()
    for key in files.keys():
        copydata[key] = files.get(key)
    try:
        for key, value in copydata.items():
            if value in ['null', '']:
                copydata[key] = None
    except Exception as e:
        pass
    return copydata


def RequestDefaultDataMapper(data, default):
    '''
    This function is return to merge file and data part
    incase there is multipart data.
    we are doing this just b'cos DRF serializers doesn't have anything
    like normal form to pass files. but mergin both works
    '''
    
    if type(data) == dict:
        copydata = QueryDict('', mutable=True)
        copydata.update(data)
    else:
        copydata = data.copy()
    for key, value  in default.items():
        copydata[key] = value
    try:
        for key, value in copydata.items():
            if value in ['null', '']:
                copydata[key] = None
    except Exception as e:
        pass
    return copydata