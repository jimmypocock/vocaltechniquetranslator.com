#!/bin/bash

echo "🔍 Checking SSL status for www.vocaltechniquetranslator.com..."

# Check SSL certificate
echo "Certificate details:"
echo | openssl s_client -servername www.vocaltechniquetranslator.com -connect www.vocaltechniquetranslator.com:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer

echo ""
echo "🌐 Testing site accessibility:"
curl -I -s https://www.vocaltechniquetranslator.com | head -3

echo ""
echo "Testing /how-it-works route:"
curl -I -s https://www.vocaltechniquetranslator.com/how-it-works | head -3