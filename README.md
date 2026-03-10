# Overview
This project creates a market calculation workflow in two steps:
1. Enter a market ID
2. Fetch source market data from external APIs
3. Enter pricing inputs
4. Calculate final Yes and No Back and Lay values
5. Display the final market in a compact exchange style layout

## Tech Stack
### Frontend
- React
- React Router
- Axios
- Vite
### Backend
- Node.js
- Express
- Axios
- CORS
- dotenv
## Connected APIs
The backend is connected to Playfair APIs:

### Market Details API
Used to fetch market metadata

`GET /api/markets?paginate=false&status=OPEN&market_id={market_id}`

### Rates API
Used to fetch source Back and Lay rates

`GET /api/markets/{market_id}/rates?type=market`

## Main Features

- Create market by market ID
- Fetch external source market data
- Spreadsheet style market input form
- Margin percent input
- Current Mean and Current Standard Deviation calculation
- Final display with:
  - Yes Back
  - Yes Lay
  - No Back
  - No Lay
- LG exchange inspired UI styling

## Formula Logic

### Current Mean
- If Source Side is Back, Current Mean = Source Back
- If Source Side is Lay, Current Mean = Source Lay

### Current Standard Deviation
Current Std Dev = Initial Std Dev × (Current Mean / Initial Mean)

### Back Yes
Back Yes = 1 / ((1 - NORM.DIST(Runs, Current Mean, Current Std Dev, TRUE)) × (1 - Margin))

### Back No
Back No = 1 / ((NORM.DIST(Runs, Current Mean, Current Std Dev, TRUE)) × (1 - Margin))

### Lay Yes
If Back Yes <= 2  
Lay Yes = Back Yes + Rate Diff  
Else  
Lay Yes = 1 / (Back No - 1) + 1

### Lay No
If Back No <= 2  
Lay No = Back No + Rate Diff  
Else  
Lay No = 1 / (Back Yes - 1) + 1 + Rate Diff

## Project Structure

```bash
Fancy Market/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
