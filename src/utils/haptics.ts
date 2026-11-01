// Device Haptic Vibration Engine for Tactile Rotary and Mechanical Interactions

export function triggerHaptic(pattern: number | number[] = 15) {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Vibration API blocked or not supported on this device
  }
}

// Distinct tactile vibration patterns for each rotary number key (0-9)
// Allows user to distinguish digits purely through tactile mechanical feedback
export const DIGIT_HAPTIC_PATTERNS: Record<string, number | number[]> = {
  // '1': Short crisp high-frequency tick
  '1': [35],
  // '2': Double mechanical pulse
  '2': [20, 30, 20],
  // '3': Triple stepped ratchet rhythm
  '3': [15, 25, 15, 25, 20],
  // '4': Rapid quad stutter detent
  '4': [12, 18, 12, 18, 12, 18, 25],
  // '5': Syncopated quintet cadence
  '5': [40, 25, 15, 25, 35],
  // '6': Heavy ascending ratchet roll
  '6': [25, 20, 30, 20, 45, 20, 55],
  // '7': Swift energetic arpeggio
  '7': [15, 15, 20, 15, 25, 15, 30, 20, 40],
  // '8': Resonant double-duo mechanical clatter
  '8': [35, 20, 35, 40, 35, 20, 50],
  // '9': Crescendo cascade from high to heavy stop
  '9': [15, 15, 20, 15, 25, 15, 30, 15, 35, 20, 65],
  // '0': Monumental deep bass resonant clack (longest travel to finger stop)
  '0': [70, 35, 95],
};

// Distinct haptic vibration for rotary number rotation & selection
export function hapticForDigit(digit: string) {
  const pattern = DIGIT_HAPTIC_PATTERNS[digit] || [25, 20];
  triggerHaptic(pattern);
}

// Crisp mechanical clock tik-tik vibration
export function hapticTikTik() {
  triggerHaptic(8);
}

// Light ratchet tick when rotary wheel moves past a detent
export function hapticRotaryTick() {
  triggerHaptic([12, 10]);
}

// Sharp mechanical clack when rotary wheel hits the brass finger stop
export function hapticFingerStop() {
  triggerHaptic([30, 25, 45]);
}

// Button click tactile pulse
export function hapticButtonClick() {
  triggerHaptic(18);
}

// Ultra-light micro haptic for small small touch interactions (buttons, tabs, icons, drag steps)
export function hapticMicro() {
  triggerHaptic(7);
}

// Crisp glass tap vibration
export function hapticGlassTap() {
  triggerHaptic(10);
}

// Detent tick for mechanical gear scrolling & rotary travel
export function hapticDetent() {
  triggerHaptic(8);
}

// Spring recoil return vibration
export function hapticSpringRecoil() {
  triggerHaptic([12, 10, 25]);
}

// Golden glow shockwave feedback when a number is successfully dialed
export function hapticDialGlowShock() {
  triggerHaptic([25, 20, 40]);
}

// Sliding swoosh haptic
export function hapticSlide() {
  triggerHaptic([10, 15, 20]);
}

// Success pulse when session starts or phone unlocks
export function hapticSuccess() {
  triggerHaptic([25, 35, 30, 20, 40]);
}

// Bell ring rhythm
export function hapticTelephoneRing() {
  triggerHaptic([80, 50, 80, 50, 140]);
}

// Solar rule warning haptic (harsh double vibration)
export function hapticSolarBlocked() {
  triggerHaptic([80, 60, 120]);
}

