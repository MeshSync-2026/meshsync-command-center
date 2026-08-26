# MeshSync Command Center

The **MeshSync Command Center** is a React and Vite single page web dashboard used by emergency dispatchers and disaster commanders to coordinate crisis response operations.

### What this repository does:
* **Cluster & Heatmap Visualization**: Aggregates live incident reports into geographic clusters with severity scores and incident counts.
* **Live Incident Triage**: Displays searchable, real time incident lists with triage flags (injuries, water needs, trapped victims) and HLC audit timelines.
* **Responder Dispatch**: Provides a fast 3 click workflow to assign registered field officers to response zones.
* **Role Based Access Control**: Enforces distinct access levels for `DISPATCHER` and `COMMANDER` roles, including device revocation and audit log inspection.
* **Cloud API Integration**: Communicates directly with the `meshsync-cloud-api` Command Center microservice via REST endpoints.
