import geopandas
import pandas
import os

RAW_DIR = "data/raw"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
PROCESSED_DIR = os.path.join(PROJECT_ROOT, "data", "processed", "by_province")
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Corrected Canadian federal riding number to province mapping
PROVINCE_MAP = {
    '10': 'NL', '11': 'NS', '12': 'PE', '13': 'NB',
    '24': 'QC', '35': 'ON', '46': 'MB', '47': 'SK',
    '48': 'AB', '59': 'BC', '60': 'YT', '61': 'NT', '62': 'NU'
}

ENGLISH_FOLDER = os.path.join(RAW_DIR, "FED_CA_2023_EN-SHP", "FED_CA_2023_EN.shp")
FRENCH_FOLDER = os.path.join(RAW_DIR, "CF_CA_2023_FR-SHP", "CF_CA_2023_FR.shp")

print("Loading datasets...")
english_gdf = geopandas.read_file(ENGLISH_FOLDER)
french_gdf = geopandas.read_file(FRENCH_FOLDER)

merged_gdf = pandas.concat([english_gdf, french_gdf], ignore_index=True)
merged_gdf = geopandas.GeoDataFrame(merged_gdf, geometry="geometry")

print("Reprojecting to WGS84...")
merged_gdf = merged_gdf.to_crs(epsg=4326)

# Extract province from FED_NUM (first 2 digits of 5-digit code)
merged_gdf['FED_NUM'] = merged_gdf['FED_NUM'].fillna(0).astype('Int64')
merged_gdf['PROV_CODE'] = merged_gdf['FED_NUM'].apply(lambda x: str(x // 1000).zfill(2) if x > 0 else 'XX')
merged_gdf['PROV_NAME'] = merged_gdf['PROV_CODE'].map(PROVINCE_MAP)

# Split by province
for prov_code, prov_abbr in PROVINCE_MAP.items():
    prov_gdf = merged_gdf[merged_gdf['PROV_CODE'] == prov_code].copy()
    if len(prov_gdf) > 0:
        output_path = os.path.join(PROCESSED_DIR, f"federal_{prov_abbr}.geojson")
        prov_gdf.to_file(output_path, driver="GeoJSON")
        print(f"  Saved {output_path} ({len(prov_gdf)} features)")

# Save combined
combined_path = os.path.join(PROJECT_ROOT, "data", "processed", "federal_all.geojson")
merged_gdf.to_file(combined_path, driver="GeoJSON")
print(f"\nSaved combined: {combined_path}")
print("Done!")