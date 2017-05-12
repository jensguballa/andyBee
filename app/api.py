from flask_restful import request

def json_to_object(schema, data_mandatory=True):
    """
    Helper function, which gets the json part from a request
    and checks it against the given schema.
    Returns a python object and a response code.
    response code 200 means "OK, no errors, json successfully
    parsed". Any other return code indicates an error.
    """
    json_data = request.get_json()
    if not json_data:
        return {'msg': 'No input data provided'}, 400 # bad request
    data, errors = schema.load(json_data)
    if errors:
        errors['msg'] = "An error occured when parsing the request."
        return errors, 422 # unprocessable entity
    if (not data) and data_mandatory:
        return {'msg': 'No input data provided'}, 400 # bad request
    return data, 200

