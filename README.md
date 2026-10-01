Here is your Start-Up Checklist for when you return to work on MapTheGov. Follow these steps in order to get your environment running exactly as we left it.

1. Activate Your Python Environment
Open your terminal, navigate to your project folder, and activate the virtual environment you created.

cd MapTheGov
source env/bin/activate

(You should see (env) appear at the start of your prompt).

2. Start the Docker Stack
Start the database and web server containers. This ensures Nginx is serving your files and PostGIS is ready.

docker compose up -d

Wait for the output to say Started.

3. Verify the Data File Exists
Ensure your conversion script has already run and the GeoJSON file is in the correct folder.

ls -l data/processed/

You should see federal.geojson (or federal_ridings.geojson if you didn't rename it).

4. Launch the Application
Open your web browser and go to: 👉 http://localhost:8080

5. Troubleshooting (If it doesn't load)
If you see "404 Not Found" for the map:
Check that frontend/map.js and frontend/main.js exist in the frontend folder.
Ensure you performed a Hard Refresh (Cmd + Shift + R).
If you see "404 Not Found" for the ridings:
Check the Console. Is it requesting /data/federal.geojson or /data/processed/federal.geojson?
Ensure docker-compose.yml and nginx.conf match that path.
Run docker compose restart web to reload Nginx config.
If you see initMap is not defined:
You likely have an old cached version of the JS.
Clear browser cache completely or use "Empty Cache and Hard Reload" in DevTools.
6. Quick Data Re-generation (Optional)
If you need to re-run the conversion script (e.g., if you downloaded new boundary data):

python source/scripts/convert_ridings.py

(Then restart Docker: docker compose restart web).

Your Current Status:

Frontend: Leaflet map with location tracking.
Backend: PostGIS database running on port 5432.
Data Pipeline: Python script converts Shapefiles → GeoJSON.
Next Goal: Add Provincial/Municipal layers and connect click events to fetch real-time data (votes/tweets).
See you next time! 🚀