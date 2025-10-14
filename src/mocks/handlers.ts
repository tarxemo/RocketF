import { http, HttpResponse } from 'msw';

// Mock data for the rocket launch
const mockRocketState = {
  isLaunched: false,
  altitude: 0,
  speed: 0,
  fuel: 100,
  status: 'idle' as 'idle' | 'launching' | 'in-flight' | 'orbit' | 'error'
};

export const handlers = [
  // Start rocket launch
  http.post('https://api.example.com/start-rocket', async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockRocketState.isLaunched = true;
    mockRocketState.status = 'launching';
    
    return HttpResponse.json({ 
      success: true, 
      message: 'Rocket launch sequence initiated',
      data: {
        launchTime: new Date().toISOString(),
        status: 'launching'
      }
    });
  }),
  
  // Step rocket (for simulation updates)
  http.post('https://api.example.com/step-rocket', async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate rocket ascent
    if (mockRocketState.altitude < 100) {
      mockRocketState.altitude += 10;
      mockRocketState.speed += 50;
      mockRocketState.fuel -= 1;
    } else if (mockRocketState.altitude < 1000) {
      mockRocketState.altitude += 50;
      mockRocketState.speed += 20;
      mockRocketState.fuel -= 0.5;
    } else {
      mockRocketState.status = 'orbit';
    }
    
    return HttpResponse.json({ 
      success: true, 
      message: 'Rocket sequence stepped',
      data: {
        ...mockRocketState,
        timestamp: new Date().toISOString()
      }
    });
  }),
];
