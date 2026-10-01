import geopandas
import pandas
import os

# Configuration
RAW_DIR = "data/raw"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
PROCESSED_DIR = os.path.join(PROJECT_ROOT, "data", "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(PROCESSED_DIR, "federal.geojson")

# Define source folders
ENGLISH_FOLDER = os.path.join(RAW_DIR, "FED_CA_2023_EN-SHP")
FRENCH_FOLDER = os.path.join(RAW_DIR, "CF_CA_2023_FR-SHP")

print("Loading English Federal Shapefile...")
english_gdf = geopandas.read_file(ENGLISH_FOLDER)

print("Loading French Federal Shapefile...")
french_gdf = geopandas.read_file(FRENCH_FOLDER)

print(f"English Federal ridings loaded: {len(english_gdf)} features")
print(f"French Federal ridings loaded: {len(french_gdf)} features")

# Merge datasets
print("Merging English and French datasets...")
merged_gdf = pandas.concat([english_gdf, french_gdf], ignore_index=True)

# Ensure the geometry column is preserved
if "geometry" in merged_gdf.columns:
    merged_gdf = geopandas.GeoDataFrame(merged_gdf, geometry="geometry")
else:
    print("Error: Geometry column missing after merge!")
    exit()

print(f"Merged dataset size: {len(merged_gdf)} features")

# Save to GeoJSON
print(f"Saving to {OUTPUT_FILE}...")
merged_gdf.to_file(OUTPUT_FILE, driver="GeoJSON")

print("Conversion Complete! File saved to frontend/federal.geojson")