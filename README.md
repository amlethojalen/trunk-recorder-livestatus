Trunk Recorder LiveStatus
==========================

Trunk Recorder LiveStatus is a companion application to Trunker Recorder which can be found [here](https://github.com/robotastic/trunk-recorder)

**These instructions are very much draft instructions, and only tested on Ubuntu**

## Install
Make sure Trunk Recorder is installed and running correctly
Follow the instructions below to install Live Status

### Install git, curl and typescript
```bash
sudo apt-get install git curl node-typescript
```

### Install Node V9
Instructions for distros can be found [here](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
Instructions for Debian and Ubuntu are listed below
```bash
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install nodejs
```

### Checkout repo
```bash
git clone https://github.com/amlethojalen/trunk-recorder-livestatus.git
cd trunk-recorder-livestatus
```

### Install npm's
```bash
sudo npm install -g typescript
npm install
```

### Compile application
```bash
tsc
```

### Update Configuration
Update the **port** (if required) and update the **captureDir** to match the **captureDir** from the Trunker-Recorder config file
```bash
pico config.js
```

### Configure **Trunk-Recorder**
Edit the **Trunk-Recorder** config and set the **statusServer** to the url to communicate to **Live Status** (by default url should be *http://127.0.0.1:8888*)

### Run the application
```bash
node app
```

### Open Live Status page
Navigate to Live Status page (by default the url should be *http://127.0.0.1:8888*)

