#!/bin/bash

echo "Testing domain redirects for vocaltechniquetranslator.com..."
echo "============================================="

domains=(
  "http://vocaltechniquetranslator.com"
  "https://vocaltechniquetranslator.com"
  "http://www.vocaltechniquetranslator.com"
  "https://www.vocaltechniquetranslator.com"
)

for domain in "${domains[@]}"; do
  echo -e "\nTesting: $domain"
  echo "---"
  
  # Follow redirects and show only headers
  response=$(curl -s -I -L "$domain" 2>&1)
  
  # Extract final URL
  final_url=$(echo "$response" | grep -i "^location:" | tail -1 | cut -d' ' -f2 | tr -d '\r')
  
  # Extract status codes
  status_codes=$(echo "$response" | grep "^HTTP" | awk '{print $2}')
  
  echo "Status codes: $(echo $status_codes | tr '\n' ' → ')"
  
  # Check final destination
  final_check=$(curl -s -I -L "$domain" | grep -i "^HTTP" | tail -1)
  if echo "$final_check" | grep -q "200"; then
    echo "✅ Resolves successfully"
  else
    echo "❌ Failed to resolve"
  fi
done

echo -e "\n============================================="
echo "All domains should redirect to: https://www.vocaltechniquetranslator.com"
echo "Expected flow: 301 → 301 → 200 (or similar)"