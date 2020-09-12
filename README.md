# Dockerized Vue with Pug

A simple Dockerized Vue setup with Pug.

## Purpose

It took some time to get everything working so hopefully someone else will find this useful.

## Features

1. Dockerized
2. Global variable support
3. Multiple Page Application Support
4. Global component registration
5. Virtual host and SSL dev server

## 1. Docker

Since everything needed is contained within this image you can simply install Docker on your computer and keep everyting neatly and safely contained inside Docker. You don't even need Node or NPM since they, along with everything else, are inside the Docker image. This is a great alternative to intalling tons of software on your device with no easy way to manage or remove it.

This also helps minimize any issues you may have due to your specific device environment such as the operating system.

Optionally, there is a bash file (vt.sh) that includes a number of docker and npm CLI shortcuts to really speed up your workflow.

If you want to give it a try add an alias to this file in you .zshrc file or equivalent for your device.

```
alias vt="./vt.sh"
```

Now you can run commands inside and outside docker like this:

```
vt build (builds Docker image)
vt run (runs Docker container)
vt cli (starts Docker command line)
vt serve (starts Webpack dev server via Vue CLI)
vt help (displays all vt commands)
```

## 2. Globals

Globals are a convenient way to define theme and application-wide data once and use across all files. Some examples include:

1. Colors
2. HTML meta data
3. Supported image sizes

**_ Never store sensitve data in globals as they end up in the final output. _**

## 3. Multiple Page Application

A page will automatically be generated for each pug template in src/pages. Each page needs a corresponding entry point in src/entries.

## 4. Global registration

All components are registered globally so there's no need to import them individually within other components or views.

**_ Views are not registered globally and are lazy loaded instead. _**

## 5. Virtual host and SSL

Accessing this app over a custom domain and SSL requires the following:

1. Host entry on your device
2. Self-signed "trusted" certificate and key

### Step 1: Add host entry

1. sudo nano /etc/hosts
2. Add a new entry to the bottom of the file

```
127.0.0.1 yourdomain.dev
```

### Step 2. Create self-signed "trusted" certificate and key

1. Open Keychain Access
2. Goto Keychain Access > Certificate Manager > Create A Certificate

```
Use the following settings:
- Name: yourdomain.dev
- Identity Type: Self Signed Root
- Certificate Type: SSL Server
- Check override defaults
- Email: Your email address
- Name: yourdomain.dev
- Key Usage Extension: Checkmark Certificate Signing
- Extended Key Usage Extension: Checkmark SSL Client Authentication
- dNSName: yourdomain.dev
- iPAddress: 127.0.0.1
```

3. Double click new certificate and expand Trust
4. Set > When using this certifcate: Always Trust
5. Right-click certificate and export to project ./certs directory
6. Convert certificate to .pem format with the following command

```
openssl pkcs12 -in ./certs/Certificates.p12 -out ./certs/yourdomain.dev.pem -nodes
```

7. Open .pem file and extract cert and key into separate files:

```
./certs/yourdomain.dev.cert
./certs/yourdomain.dev.key
```
