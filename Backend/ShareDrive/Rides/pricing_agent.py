"""
LangGraph-powered pricing agent.

Graph flow:
  calculate_distance → fetch_pricing_config → compute_price → prepare_result

Input state:
    start_lat, start_lon, end_lat, end_lon  (float)
    vehicle_type  (str)
    ride_mode     (str: 'normal' | 'shared')

Output:
    {
      distance_km : float,
      base_fare   : float,
      ride_price  : float,   # driver portion  (distance × rate_per_km)
      tax_amount  : float,   # owner portion   (distance × tax_per_km)
      total_price : float,   # base_fare + ride_price + tax_amount
      rate_per_km : float,
      tax_per_km  : float,
    }
"""

import math
from typing import TypedDict, Optional

from langgraph.graph import StateGraph, END


# ─── State schema ─────────────────────────────────────────────────────────────

class PricingState(TypedDict):
    # Input
    start_lat:    float
    start_lon:    float
    end_lat:      float
    end_lon:      float
    vehicle_type: str
    ride_mode:    str

    # Intermediate
    distance_km:  Optional[float]
    base_fare:    Optional[float]
    rate_per_km:  Optional[float]
    tax_per_km:   Optional[float]

    # Output
    ride_price:   Optional[float]
    tax_amount:   Optional[float]
    total_price:  Optional[float]
    error:        Optional[str]


# ─── Node helpers ─────────────────────────────────────────────────────────────

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two GPS coordinates in kilometres."""
    R = 6371.0  # Earth radius in km
    phi1, phi2   = math.radians(lat1), math.radians(lat2)
    dphi         = math.radians(lat2 - lat1)
    dlambda      = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ─── Graph nodes ──────────────────────────────────────────────────────────────

def calculate_distance(state: PricingState) -> PricingState:
    """Node 1: Compute Haversine distance in km."""
    try:
        km = _haversine_km(
            float(state['start_lat']), float(state['start_lon']),
            float(state['end_lat']),   float(state['end_lon']),
        )
        # Minimum trip 1 km so pricing is never zero
        state['distance_km'] = round(max(km, 1.0), 2)
    except Exception as exc:
        state['error'] = f"Distance calculation failed: {exc}"
    return state


def fetch_pricing_config(state: PricingState) -> PricingState:
    """Node 2: Load VehiclePricingConfig from DB for the requested vehicle+mode."""
    if state.get('error'):
        return state
    try:
        from Rides.models import VehiclePricingConfig
        config = VehiclePricingConfig.objects.get(
            vehicle_type=state['vehicle_type'],
            ride_mode=state['ride_mode'],
            is_active=True,
        )
        state['base_fare']   = float(config.base_fare)
        state['rate_per_km'] = float(config.rate_per_km)
        state['tax_per_km']  = float(config.tax_per_km)
    except VehiclePricingConfig.DoesNotExist:
        state['error'] = (
            f"No active pricing found for vehicle_type='{state['vehicle_type']}' "
            f"and ride_mode='{state['ride_mode']}'. "
            "Please ask admin to configure pricing."
        )
    except Exception as exc:
        state['error'] = f"Pricing config fetch failed: {exc}"
    return state


def compute_price(state: PricingState) -> PricingState:
    """Node 3: Calculate ride price and tax."""
    if state.get('error'):
        return state
    try:
        dist  = state['distance_km']
        state['ride_price']  = round(float(state['base_fare']) + dist * state['rate_per_km'], 2)
        state['tax_amount']  = round(dist * state['tax_per_km'], 2)
        state['total_price'] = round(state['ride_price'] + state['tax_amount'], 2)
    except Exception as exc:
        state['error'] = f"Price computation failed: {exc}"
    return state


def prepare_result(state: PricingState) -> PricingState:
    """Node 4: Final pass — nothing to do, just return clean state."""
    return state


# ─── Build graph ──────────────────────────────────────────────────────────────

def _build_graph() -> StateGraph:
    builder = StateGraph(PricingState)
    builder.add_node("calculate_distance",   calculate_distance)
    builder.add_node("fetch_pricing_config", fetch_pricing_config)
    builder.add_node("compute_price",        compute_price)
    builder.add_node("prepare_result",       prepare_result)

    builder.set_entry_point("calculate_distance")
    builder.add_edge("calculate_distance",   "fetch_pricing_config")
    builder.add_edge("fetch_pricing_config", "compute_price")
    builder.add_edge("compute_price",        "prepare_result")
    builder.add_edge("prepare_result",       END)
    return builder.compile()


_graph = _build_graph()


# ─── Public API ───────────────────────────────────────────────────────────────

def estimate_ride_price(
    start_lat: float,
    start_lon: float,
    end_lat:   float,
    end_lon:   float,
    vehicle_type: str,
    ride_mode:    str,
) -> dict:
    """
    Run the LangGraph pricing agent and return a price-breakdown dict.

    Raises ValueError if the agent returns an error.
    """
    initial_state: PricingState = {
        'start_lat':    start_lat,
        'start_lon':    start_lon,
        'end_lat':      end_lat,
        'end_lon':      end_lon,
        'vehicle_type': vehicle_type,
        'ride_mode':    ride_mode,
        'distance_km':  None,
        'base_fare':    None,
        'rate_per_km':  None,
        'tax_per_km':   None,
        'ride_price':   None,
        'tax_amount':   None,
        'total_price':  None,
        'error':        None,
    }

    result = _graph.invoke(initial_state)

    if result.get('error'):
        raise ValueError(result['error'])

    return {
        'distance_km':  result['distance_km'],
        'base_fare':    result['base_fare'],
        'ride_price':   result['ride_price'],
        'tax_amount':   result['tax_amount'],
        'total_price':  result['total_price'],
        'rate_per_km':  result['rate_per_km'],
        'tax_per_km':   result['tax_per_km'],
    }
