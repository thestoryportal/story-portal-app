#!/usr/bin/env python3
"""
lpips_analyze.py

LPIPS (Learned Perceptual Image Patch Similarity) analysis for animation frames.
Uses VGG backbone for perceptual similarity scoring.

Usage:
  # Single pair
  python lpips_analyze.py --captured img1.png --reference img2.png

  # Batch mode (JSON input)
  echo '[{"captured": "a.png", "reference": "b.png"}]' | python lpips_analyze.py --batch

  # Batch mode with file
  python lpips_analyze.py --batch --input pairs.json --output scores.json

Output:
  JSON with LPIPS scores (lower = more similar, 0 = identical)
"""

import argparse
import json
import sys
import os
from pathlib import Path

# Suppress warnings before importing torch
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import torch
import lpips
from PIL import Image
import numpy as np


def get_device():
    """Detect best available device (CUDA > MPS > CPU)"""
    if torch.cuda.is_available():
        return torch.device("cuda")
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return torch.device("mps")
    else:
        return torch.device("cpu")


def load_image(path, size=None):
    """Load image and convert to tensor for LPIPS"""
    img = Image.open(path).convert('RGB')

    if size:
        img = img.resize(size, Image.Resampling.LANCZOS)

    # Convert to numpy, normalize to [-1, 1] for LPIPS
    img_np = np.array(img).astype(np.float32) / 255.0
    img_np = img_np * 2.0 - 1.0  # Scale to [-1, 1]

    # Convert to tensor: [H, W, C] -> [1, C, H, W]
    img_tensor = torch.from_numpy(img_np).permute(2, 0, 1).unsqueeze(0)

    return img_tensor


def compute_lpips(model, captured_path, reference_path, device):
    """Compute LPIPS distance between two images"""
    try:
        # Load images
        captured = load_image(captured_path)
        reference = load_image(reference_path)

        # Resize if dimensions don't match
        if captured.shape != reference.shape:
            # Resize captured to match reference
            ref_size = (reference.shape[3], reference.shape[2])  # (W, H)
            captured = load_image(captured_path, size=ref_size)

        # Move to device
        captured = captured.to(device)
        reference = reference.to(device)

        # Compute LPIPS
        with torch.no_grad():
            distance = model(captured, reference)

        return float(distance.cpu().numpy().flatten()[0])

    except Exception as e:
        return {"error": str(e)}


def process_batch(pairs, model, device, verbose=False):
    """Process a batch of image pairs"""
    results = []

    for i, pair in enumerate(pairs):
        captured = pair.get("captured")
        reference = pair.get("reference")

        if not captured or not reference:
            results.append({
                "captured": captured,
                "reference": reference,
                "error": "Missing captured or reference path"
            })
            continue

        if not os.path.exists(captured):
            results.append({
                "captured": captured,
                "reference": reference,
                "error": f"Captured file not found: {captured}"
            })
            continue

        if not os.path.exists(reference):
            results.append({
                "captured": captured,
                "reference": reference,
                "error": f"Reference file not found: {reference}"
            })
            continue

        if verbose:
            print(f"  [{i+1}/{len(pairs)}] {os.path.basename(captured)}", file=sys.stderr)

        score = compute_lpips(model, captured, reference, device)

        if isinstance(score, dict) and "error" in score:
            results.append({
                "captured": captured,
                "reference": reference,
                "error": score["error"]
            })
        else:
            results.append({
                "captured": captured,
                "reference": reference,
                "lpips": score
            })

    return results


def main():
    parser = argparse.ArgumentParser(description="LPIPS perceptual similarity analysis")
    parser.add_argument("--captured", "-c", help="Path to captured image")
    parser.add_argument("--reference", "-r", help="Path to reference image")
    parser.add_argument("--batch", "-b", action="store_true", help="Batch mode (read JSON from stdin or --input)")
    parser.add_argument("--input", "-i", help="Input JSON file for batch mode")
    parser.add_argument("--output", "-o", help="Output JSON file (default: stdout)")
    parser.add_argument("--net", default="vgg", choices=["vgg", "alex", "squeeze"], help="Network backbone")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")

    args = parser.parse_args()

    # Detect device
    device = get_device()
    if args.verbose:
        print(f"Using device: {device}", file=sys.stderr)

    # Load model
    if args.verbose:
        print(f"Loading LPIPS model ({args.net})...", file=sys.stderr)

    model = lpips.LPIPS(net=args.net, verbose=False).to(device)
    model.eval()

    if args.verbose:
        print("Model loaded.", file=sys.stderr)

    # Process based on mode
    if args.batch:
        # Batch mode
        if args.input:
            with open(args.input, 'r') as f:
                pairs = json.load(f)
        else:
            pairs = json.load(sys.stdin)

        results = process_batch(pairs, model, device, args.verbose)

        # Compute aggregate stats
        valid_scores = [r["lpips"] for r in results if "lpips" in r]
        aggregate = {
            "count": len(results),
            "valid": len(valid_scores),
            "errors": len(results) - len(valid_scores)
        }

        if valid_scores:
            aggregate["mean"] = sum(valid_scores) / len(valid_scores)
            aggregate["min"] = min(valid_scores)
            aggregate["max"] = max(valid_scores)

        output = {
            "device": str(device),
            "network": args.net,
            "aggregate": aggregate,
            "results": results
        }

    else:
        # Single pair mode
        if not args.captured or not args.reference:
            parser.error("--captured and --reference required in single mode")

        score = compute_lpips(model, args.captured, args.reference, device)

        if isinstance(score, dict) and "error" in score:
            output = {
                "device": str(device),
                "network": args.net,
                "captured": args.captured,
                "reference": args.reference,
                "error": score["error"]
            }
        else:
            output = {
                "device": str(device),
                "network": args.net,
                "captured": args.captured,
                "reference": args.reference,
                "lpips": score
            }

    # Output
    output_json = json.dumps(output, indent=2)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output_json)
        if args.verbose:
            print(f"Results written to: {args.output}", file=sys.stderr)
    else:
        print(output_json)


if __name__ == "__main__":
    main()
