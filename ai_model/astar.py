"""
A* (A-Star) Hazard-Aware Routing Algorithm
SIH Project: Hazard Red Zone Alert & Rescue Coordination System

This script finds the safest (hazard-avoiding) route for rescue teams.
It treats the map as a grid and assigns high cost to Red Zone cells.
"""

import heapq
import json
import sys
import math

# ----------- GRID CONFIGURATION -----------
# Grid represents Kerala's flood-prone region (simplified 20x20 grid)
# 0 = Safe zone, 1 = Moderate risk, 2 = High risk (RED ZONE - avoid!)
GRID = [
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

# Cost to enter each cell type
CELL_COST = {
    0: 1,    # Safe - normal cost
    1: 8,    # Moderate risk - high cost (discouraged)
    2: 100   # Red Zone - very high cost (almost impassable)
}

ROWS = len(GRID)
COLS = len(GRID[0])


def heuristic(a, b):
    """Manhattan distance heuristic for A*"""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def astar(start, goal, grid=GRID):
    """
    A* pathfinding algorithm that finds the safest route
    avoiding Red Zones (cost=100) and preferring safe corridors.
    
    Args:
        start: (row, col) tuple - rescue team starting position
        goal: (row, col) tuple - incident/destination position
        grid: 2D grid with hazard levels (0=safe, 1=moderate, 2=red zone)
    
    Returns:
        dict with path, total_cost, safety_rating, and grid_visualization
    """
    open_set = []
    heapq.heappush(open_set, (0, start))
    
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0),  # Cardinal
                  (1, 1), (1, -1), (-1, 1), (-1, -1)]  # Diagonal
    
    while open_set:
        current = heapq.heappop(open_set)[1]
        
        if current == goal:
            # Reconstruct path
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            
            # Calculate safety rating
            red_zone_cells = sum(1 for r, c in path if grid[r][c] == 2)
            moderate_cells = sum(1 for r, c in path if grid[r][c] == 1)
            total_cost = g_score[goal]
            
            if red_zone_cells == 0 and moderate_cells == 0:
                safety = "FULLY SAFE"
            elif red_zone_cells == 0:
                safety = "MOSTLY SAFE"
            else:
                safety = "PARTIAL RISK"
            
            # Build grid visualization with path
            vis_grid = [row[:] for row in grid]
            for r, c in path:
                if (r, c) != start and (r, c) != goal:
                    vis_grid[r][c] = 9  # Mark path

            return {
                "success": True,
                "path": path,
                "path_length": len(path),
                "total_cost": total_cost,
                "red_zone_cells_crossed": red_zone_cells,
                "moderate_risk_cells": moderate_cells,
                "safety_rating": safety,
                "estimated_time_minutes": round(len(path) * 1.5, 1),
                "algorithm": "A* (Hazard-Aware)",
                "grid_visualization": vis_grid
            }
        
        row, col = current
        for dr, dc in directions:
            neighbor = (row + dr, col + dc)
            nr, nc = neighbor
            
            if 0 <= nr < ROWS and 0 <= nc < COLS:
                move_cost = math.sqrt(2) if dr != 0 and dc != 0 else 1
                cell_cost = CELL_COST.get(grid[nr][nc], 1)
                tentative_g = g_score[current] + move_cost * cell_cost
                
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))
    
    return {"success": False, "error": "No path found between given points"}


# Predefined routes for demo incidents (accept both SIH-90 and SIH-090)
INCIDENT_ROUTES = {
    "SIH-090": {"start": (19, 19), "goal": (3, 7), "label": "Aluva Bridge Flash Flood"},
    "SIH-091": {"start": (19, 18), "goal": (2, 6), "label": "Periyar River Bank - Kalady"},
    "SIH-092": {"start": (18, 19), "goal": (4, 8), "label": "Chalakudy River Crossing"},
    "SIH-093": {"start": (19, 19), "goal": (10, 12), "label": "NH-66 Munnar Ghat Landslide"},
    "SIH-094": {"start": (0, 0), "goal": (10, 11), "label": "Wayanad Chooralmala Slope"},
    "SIH-089": {"start": (0, 0), "goal": (15, 15), "label": "Kuttanad Lowland Evacuation"},
}


if __name__ == "__main__":
    # Accept incident_id as argument, or run default demo
    incident_id = sys.argv[1] if len(sys.argv) > 1 else "SIH-090"
    incident_id = str(incident_id).replace("#", "").strip()
    if incident_id.upper().startswith("SIH-"):
        parts = incident_id.split("-", 1)
        if len(parts) == 2 and parts[1].isdigit():
            incident_id = f"SIH-{parts[1].zfill(3)}"
    
    if incident_id in INCIDENT_ROUTES:
        route_info = INCIDENT_ROUTES[incident_id]
        start = route_info["start"]
        goal = route_info["goal"]
        label = route_info["label"]
    else:
        # Custom coordinates from JSON argument
        try:
            coords = json.loads(incident_id)
            start = tuple(coords["start"])
            goal = tuple(coords["goal"])
            label = coords.get("label", "Custom Route")
        except:
            start = (19, 19)
            goal = (3, 7)
            label = "Default Route"
    
    result = astar(start, goal)
    result["incident"] = label
    result["start"] = start
    result["goal"] = goal
    # Remove grid visualization from JSON output to keep it clean
    grid_vis = result.pop("grid_visualization", None)
    print(json.dumps(result))
