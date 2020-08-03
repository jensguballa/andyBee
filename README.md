# andyBee

![andiBee](app/static/images/andyBee.png)
A geocache database with a web frontend

# Status

The status of this SW is pre-alpha. A lot of features are simply not yet implemented. On the other hand you might already get an impression of the GUI and how this DB will work.

The following features are incomplete (and this list is incomplete as well):

* Filters are only implemented for a very limited set of properties
* Updating the coordinates of geocaches (e.g. for solved mysteries) is not yet implemented
* DB-maintenance not implemented, e.g. delete geocaches which are not updated for a specific time period
* Preferences needs to be extended
* and of course: documentation is missing. For now: Read the code. ;-)

# Screenshots

Refer to [screenshots.md](doc/screenshots.md)

# Installation

The installation of *andyBee* depends on the following SW:

- python - of course. The provided version of *andyBee* was developed using python 2.7.13.

- pip - a python package manager

- [yarn](https://yarnpkg.com/lang/en/) - a dependency management for JavaScript

## Installation of python packages

It is recommended to use virtualenv for installing the python packages, as this creates a virtual python environment and allows installation of packages without impacting other (system-) python installations. 

Commands to create the virtual environment (optional):

    $ virtualenv venv
    $ source venv/bin/activate

Commands to install the python packages:

    $ pip install -r requirements.txt

## Installation of JavaScript libraries

Commands:

    $ cd app/static/external
    $ yarn

# Usage

Command to start the *andyBee* web server:

    $ python andyBee.py

The web server will listen on port 5000. 

In your browser, open the URL [localhost:5000](http://localhost:5000/)

# Licence

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
