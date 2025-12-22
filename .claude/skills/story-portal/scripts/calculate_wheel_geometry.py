#!/usr/bin/env python3
"""
Wheel Geometry Calculator for Story Portal

Calculates optimal wheel dimensions based on viewport size to prevent
panel gaps while maximizing visual presence.

Usage:
    python calculate_wheel_geometry.py <viewport_width> [viewport_height]
    
Example:
    python calculate_wheel_geometry.py 390 844
    # Output: Geometry for iPhone 16 Pro
"""

import sys
import math
import json

# Constants (DO NOT CHANGE without testing across all devices)
BASE_RADIUS_MULTIPLIER = 0.18
MIN_RADIUS = 110
MAX_RADIUS = 160
PANEL_COUNT = 20
DEGREES_PER_PANEL = 360 / PANEL_COUNT  # 18°
OVERLAP_BUFFER = 1.05  # 5% overlap to prevent gaps


def calculate_radius(viewport_width: float) -> float:
    """Calculate constrained wheel radius."""
    raw = viewport_width * BASE_RADIUS_MULTIPLIER
    return min(MAX_RADIUS, max(MIN_RADIUS, raw))


def calculate_arc_length(radius: float) -> float:
    """Calculate arc length between panel centers."""
    return 2 * math.pi * radius * (DEGREES_PER_PANEL / 360)


def calculate_panel_width(radius: float) -> float:
    """Calculate minimum panel width to prevent gaps."""
    arc = calculate_arc_length(radius)
    return math.ceil(arc * OVERLAP_BUFFER)


def calculate_panel_height(viewport_height: float) -> float:
    """Calculate responsive panel height."""
    base_height = viewport_height * 0.12
    return min(120, max(60, base_height))


def calculate_font_size(viewport_width: float) -> int:
    """Calculate responsive font size for prompt text."""
    if viewport_width < 480:
        return 14
    elif viewport_width < 768:
        return 16
    elif viewport_width < 1024:
        return 18
    else:
        return 20


def calculate_wheel_geometry(viewport_width: float, viewport_height: float) -> dict:
    """Calculate all wheel geometry parameters."""
    radius = calculate_radius(viewport_width)
    arc_length = calculate_arc_length(radius)
    panel_width = calculate_panel_width(radius)
    panel_height = calculate_panel_height(viewport_height)
    font_size = calculate_font_size(viewport_width)
    
    # Check for potential gaps
    has_gap_risk = arc_length > panel_width * 0.95
    
    return {
        "viewport": {
            "width": viewport_width,
            "height": viewport_height,
            "aspect_ratio": round(viewport_width / viewport_height, 3)
        },
        "wheel": {
            "radius": round(radius, 2),
            "diameter": round(radius * 2, 2),
            "circumference": round(2 * math.pi * radius, 2)
        },
        "panels": {
            "count": PANEL_COUNT,
            "degrees_per_panel": DEGREES_PER_PANEL,
            "arc_length": round(arc_length, 2),
            "min_width": panel_width,
            "height": round(panel_height, 2),
            "font_size": font_size
        },
        "validation": {
            "gap_risk": has_gap_risk,
            "radius_at_limit": radius == MIN_RADIUS or radius == MAX_RADIUS,
            "status": "WARNING" if has_gap_risk else "OK"
        },
        "css": {
            "transform_origin": f"center center -{radius}px",
            "panel_translateZ": f"{radius}px"
        }
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python calculate_wheel_geometry.py <width> [height]")
        print("\nCommon device sizes:")
        devices = [
            ("iPhone SE", 375, 667),
            ("iPhone 16 Pro", 393, 852),
            ("iPhone 16 Pro Max", 430, 932),
            ("iPad Mini", 768, 1024),
            ("iPad Pro 12.9", 1024, 1366),
        ]
        for name, w, h in devices:
            result = calculate_wheel_geometry(w, h)
            status = result["validation"]["status"]
            print(f"  {name}: {w}x{h} → radius={result['wheel']['radius']}px [{status}]")
        sys.exit(1)
    
    width = float(sys.argv[1])
    height = float(sys.argv[2]) if len(sys.argv) > 2 else width * 1.78  # Default 16:9
    
    result = calculate_wheel_geometry(width, height)
    
    print(json.dumps(result, indent=2))
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"SUMMARY for {width}x{height}")
    print(f"{'='*50}")
    print(f"Radius:      {result['wheel']['radius']}px")
    print(f"Panel Width: {result['panels']['min_width']}px (min)")
    print(f"Panel Height:{result['panels']['height']}px")
    print(f"Font Size:   {result['panels']['font_size']}px")
    print(f"Status:      {result['validation']['status']}")
    if result['validation']['gap_risk']:
        print("\n⚠️  WARNING: Gap risk detected. Consider reducing radius multiplier.")


if __name__ == "__main__":
    main()
