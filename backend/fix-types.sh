#!/bin/bash

# Script to add Promise<Response | void> return type to all async methods in controllers

for file in src/controllers/*.ts; do
  echo "Processing $file..."
  # Add return type to static async methods that don't have it
  sed -i '' 's/static async \([a-zA-Z]*\)([^)]*): void {/static async \1(req: AuthRequest | Request, res: Response, next: NextFunction): Promise<Response | void> {/g' "$file"
  sed -i '' 's/static async \([a-zA-Z]*\)(req: [^,]*, res: Response, next: NextFunction) {/static async \1(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {/g' "$file"
done

echo "Done!"
