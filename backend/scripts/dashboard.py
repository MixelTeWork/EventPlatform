import os

from flask import Flask, g
import flask_monitoringdashboard as dashboard
from bafser import randstr


def use_dashboard(app: Flask, file="dashboard.cfg", envpwd="ADMINPWD", envdb="DBDASHBOARDPATH"):
    dashboard.config.init_from(file=file)
    password = os.environ.get(envpwd)
    if password is None:
        raise Exception(f"env var not set: {envpwd}")
    db = os.environ.get(envdb)
    if db is None:
        raise Exception(f"env var not set: {envdb}")
    dashboard.config.security_token = randstr(32)
    dashboard.config.password = password
    dashboard.config.database_name = db
    dashboard.config.group_by = lambda: g.get("userId", "anonym")  # type: ignore
    dashboard.bind(app, schedule=False)
