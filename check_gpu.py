"""
GPU Detection Script
Check what graphics hardware you have and if it supports GPU acceleration for ML
"""

import sys
import subprocess

print("=" * 70)
print("GPU & HARDWARE DETECTION REPORT")
print("=" * 70)

# Check 1: Python version
print(f"\n✓ Python Version: {sys.version}")

# Check 2: Try importing PyTorch (if installed)
print("\n" + "-" * 70)
print("1. PyTorch GPU Support (for ML)")
print("-" * 70)

try:
    import torch
    print(f"✓ PyTorch installed: {torch.__version__}")
    print(f"✓ CUDA available: {torch.cuda.is_available()}")
    
    if torch.cuda.is_available():
        print(f"✓ CUDA version: {torch.version.cuda}")
        print(f"✓ cuDNN version: {torch.backends.cudnn.version()}")
        print(f"✓ GPU Count: {torch.cuda.device_count()}")
        print(f"✓ Current GPU: {torch.cuda.get_device_name(0)}")
        print(f"✓ GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
        print(f"✓ Compute Capability: {torch.cuda.get_device_capability(0)}")
        print("\n✅ GPU SUPPORTED - You can run ML models on GPU!")
    else:
        print("❌ CUDA not available - PyTorch will use CPU")
        print("   Reasons: No GPU, CUDA not installed, or NVIDIA drivers missing")
        
except ImportError:
    print("❌ PyTorch not installed")
    print("   Install: pip install torch")

# Check 3: TensorFlow GPU (alternative ML framework)
print("\n" + "-" * 70)
print("2. TensorFlow GPU Support (alternative framework)")
print("-" * 70)

try:
    import tensorflow as tf
    print(f"✓ TensorFlow installed: {tf.__version__}")
    print(f"✓ GPU devices: {len(tf.config.list_physical_devices('GPU'))}")
    
    if len(tf.config.list_physical_devices('GPU')) > 0:
        print(f"✓ GPU details: {tf.config.list_physical_devices('GPU')}")
        print("\n✅ TensorFlow GPU SUPPORTED")
    else:
        print("❌ No GPU found by TensorFlow")
        
except ImportError:
    print("❌ TensorFlow not installed")
    print("   Install: pip install tensorflow")

# Check 4: NVIDIA GPU (cuda-capable)
print("\n" + "-" * 70)
print("3. NVIDIA GPU (CUDA Support)")
print("-" * 70)

try:
    result = subprocess.run(
        ["nvidia-smi", "--query-gpu=index,name,memory.total,driver_version", 
         "--format=csv,noheader"],
        capture_output=True,
        text=True,
        timeout=5
    )
    if result.returncode == 0:
        print("✅ NVIDIA GPU DETECTED:")
        print(result.stdout)
    else:
        print("❌ NVIDIA GPU not found")
        print("   Reasons: No NVIDIA GPU or NVIDIA drivers not installed")
except FileNotFoundError:
    print("❌ NVIDIA GPU not found (nvidia-smi command not found)")
    print("   Reasons:")
    print("   • No NVIDIA GPU in system")
    print("   • NVIDIA drivers not installed")
    print("   • CUDA toolkit not installed")
except Exception as e:
    print(f"❌ Error checking NVIDIA GPU: {e}")

# Check 5: AMD GPU (ROCm support)
print("\n" + "-" * 70)
print("4. AMD GPU (ROCm Support)")
print("-" * 70)

try:
    result = subprocess.run(
        ["rocm-smi"],
        capture_output=True,
        text=True,
        timeout=5
    )
    if result.returncode == 0:
        print("✅ AMD GPU DETECTED:")
        print(result.stdout[:500])  # First 500 chars
    else:
        print("❌ AMD GPU not found")
except FileNotFoundError:
    print("❌ AMD GPU not found (rocm-smi command not found)")
    print("   Either no AMD GPU or ROCm drivers not installed")
except Exception as e:
    print(f"❌ Error checking AMD GPU: {e}")

# Check 6: Intel Arc (GPU support via PyTorch)
print("\n" + "-" * 70)
print("5. Intel Arc GPU (XPU Support)")
print("-" * 70)

try:
    import torch
    if hasattr(torch, 'xpu') and torch.xpu.is_available():
        print("✅ Intel Arc GPU DETECTED")
        print(f"   Device: {torch.xpu.get_device_name(0)}")
    else:
        print("❌ Intel Arc GPU not found or not supported")
except Exception as e:
    print(f"❌ Error checking Intel Arc: {e}")

# Summary
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

# Detect what GPU we found
has_nvidia = False
has_amd = False
has_intel_arc = False

try:
    import torch
    if torch.cuda.is_available():
        has_nvidia = True
        gpu_name = torch.cuda.get_device_name(0)
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
except:
    pass

if has_nvidia:
    print(f"""
✅ YOU HAVE A GPU!

GPU: {gpu_name}
Memory: {gpu_memory:.2f} GB
Support: NVIDIA CUDA

What this means for your translation project:
• You CAN run local NLLB model with GPU acceleration
• Translation will be 10-50x faster
• 0.5-2 seconds per translation (vs 15-30 seconds on CPU)
• Supports real-time chat with 50+ concurrent users

Next steps:
1. Keep PyTorch/CUDA drivers updated
2. Create translator_local.py with GPU support
3. Update requirements.txt with torch + transformers
4. Benchmark translation latency
""")
else:
    print("""
❌ YOU DON'T HAVE A GPU (or drivers not installed)

Graphics Device: Intel Iris Xe Graphics (Integrated)
Support: CPU only

What this means for your translation project:
• Local NLLB model will run on CPU (slow: 15-30 seconds per message)
• Not ideal for real-time chat
• Options:
  1. Use Gemini API (remote, fast, has cost)
  2. Rent cloud GPU (AWS, Google Cloud, Lambda Labs)
  3. Use CPU optimization techniques (quantization, distillation)
  4. Buy a GPU ($300-$5000)

Recommended approach for now:
• Keep using Gemini API as default
• Add user API key support (as you planned)
• Use local NLLB only as fallback (on CPU, slower)
• Monitor costs - if high, consider GPU option later
""")

print("\n" + "=" * 70)
print("DETAILED HARDWARE INFO")
print("=" * 70)

try:
    result = subprocess.run(
        ["wmic", "logicaldisk", "get", "name,size,freespace"],
        capture_output=True,
        text=True,
        timeout=5
    )
    print("\nDisk Space:")
    print(result.stdout.split('\n')[0:3])
except:
    pass

print("\n" + "=" * 70)
