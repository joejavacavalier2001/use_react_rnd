#!/usr/bin/python3
import cgitb 
cgitb.enable()
import simplejson as json
import sys
sys.stderr = sys.stdout
#import sys
#from google.oauth2 import id_token
#from google.auth.transport import requests

#args=sys.stdin.read()
#POST = json.loads(args)
#token = POST["id"]

#CLIENT_ID = "571906986512-6tg59t12ugt9pbvp46bis6msvi850dcv.apps.googleusercontent.com"
#userid = ""

#try:
    # Specify the CLIENT_ID of the app that accesses the backend:
    #idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

    # Or, if multiple clients access the backend server:
    # idinfo = id_token.verify_oauth2_token(token, requests.Request())
    # if idinfo['aud'] not in [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]:
    #     raise ValueError('Could not verify audience.')

    # If auth request is from a G Suite domain:
    # if idinfo['hd'] != GSUITE_DOMAIN_NAME:
    #     raise ValueError('Wrong hosted domain.')

    # ID token is valid. Get the user's Google Account ID from the decoded token.
    #userid = idinfo['sub']
#except ValueError:
    #userid = "bad token"

response = {"name": "hello world"};

#print("cache-control: no-cache, must-revalidate, max-age=0\n");
print("Content-Type: text/plain")
print()
#print(json.JSONEncoder().encode(response))
print("hello world")


