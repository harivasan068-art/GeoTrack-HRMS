import os
from PIL import Image, ImageDraw, ImageFont

public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
icons_dir = os.path.join(public_dir, "icons")
os.makedirs(public_dir, exist_ok=True)
os.makedirs(icons_dir, exist_ok=True)

def create_pwa_icon(size=512, is_maskable=False):
    # Create image with RGBA
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw rounded background gradient approximation
    bg_color = (79, 70, 229, 255) # Indigo #4f46e5
    corner_radius = 0 if is_maskable else int(size * 0.25)
    
    draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=bg_color)
    
    # Outer circle indicator
    center = size // 2
    r_outer = int(size * 0.38)
    draw.ellipse([center - r_outer, center - r_outer, center + r_outer, center + r_outer], outline=(255, 255, 255, 30), width=int(size * 0.015))

    # Location Pin Shape
    pin_w = int(size * 0.35)
    pin_h = int(size * 0.48)
    pin_top = int(size * 0.18)
    pin_cx = center
    
    # Pin top circle
    r_pin = pin_w // 2
    pin_cy = pin_top + r_pin
    draw.ellipse([pin_cx - r_pin, pin_cy - r_pin, pin_cx + r_pin, pin_cy + r_pin], fill=(56, 189, 248, 255)) # Sky blue
    
    # Pin bottom triangle tip
    tip_y = pin_top + pin_h
    draw.polygon([(pin_cx - r_pin + 5, pin_cy + 10), (pin_cx + r_pin - 5, pin_cy + 10), (pin_cx, tip_y)], fill=(56, 189, 248, 255))
    
    # Inner white circle
    r_inner = int(r_pin * 0.45)
    draw.ellipse([pin_cx - r_inner, pin_cy - r_inner, pin_cx + r_inner, pin_cy + r_inner], fill=(255, 255, 255, 255))
    
    # Inner indigo dot
    r_dot = int(r_inner * 0.55)
    draw.ellipse([pin_cx - r_dot, pin_cy - r_dot, pin_cx + r_dot, pin_cy + r_dot], fill=(79, 70, 229, 255))

    return img

# Save icons
img_192 = create_pwa_icon(192, is_maskable=False)
img_192.save(os.path.join(public_dir, "pwa-192x192.png"))
img_192.save(os.path.join(icons_dir, "pwa-192x192.png"))

img_512 = create_pwa_icon(512, is_maskable=False)
img_512.save(os.path.join(public_dir, "pwa-512x512.png"))
img_512.save(os.path.join(icons_dir, "pwa-512x512.png"))

img_maskable = create_pwa_icon(512, is_maskable=True)
img_maskable.save(os.path.join(public_dir, "maskable-icon-512x512.png"))
img_maskable.save(os.path.join(icons_dir, "maskable-icon-512x512.png"))

img_apple = create_pwa_icon(180, is_maskable=False)
img_apple.save(os.path.join(public_dir, "apple-touch-icon.png"))
img_apple.save(os.path.join(icons_dir, "apple-touch-icon.png"))

print("Successfully generated all PWA PNG icons (192x192, 512x512, maskable, apple-touch-icon)!")
