const { useState, useRef, useEffect } = React;

// === TEST MODE FLAG - SET TO false TO RESTORE NORMAL BEHAVIOR ===
const TEST_MODE = false;

// === ANIMATION DISABLE FLAG - SET TO true TO SKIP PANEL ANIMATION ===
const DISABLE_PANEL_ANIMATION = true;

// All prompts from Google Doc (raw, no line breaks)
const ALL_PROMPTS = [
  'A love story',
  'When someone was a friend to me',
  'My first time',
  'When I fell in love',
  'Most tender moment of my life...',
  'When I see the world with eyes of love',
  'Dreams',
  'Eye of the Tiger!!',
  'A leap of faith',
  'When it all changed for me',
  'Overcoming Fear',
  'Ghost Story!',
  'Near death experience',
  'And then I got caught',
  'When I got away with it',
  'This one time at the Burn',
  "That's gross!",
  'Unexpected bodily function',
  'I was so embarrassed',
  'Drunken stupidity & hilarity',
  'Bamboozled!',
  'Conception',
  'My birth story',
  'When I was little',
  'High school was',
  'Something I grew out of',
  'If I knew then what I know now',
  'The wisdom that lives in me says',
  'What I learned from hard times',
  'A song that holds a memory for me',
  'Breakdown to breakthrough',
  'A funeral',
  'If I could speak to someone passed on',
  "You're Fired!",
  'Job Interview',
  'Epic fail',
  'A Tall Tale',
  'An epic adventure',
  'Crazy psychedelic trip',
  'Triumph!',
  'A trailblazer I met',
  'A star encounter',
  'Someone who taught me something',
  'Someone I admire',
  'Something I do really well',
  'Yeah, I suck at that',
  'My 5 minutes of fame',
  'How I got my million dollar idea',
  'When I told the truth',
  'When time stood still',
  'All in the family',
  'Mothers',
  'Fathers',
  'Sisters and brothers',
  'My first concert experience',
  'My relationship with my body',
  'What I love most about myself',
  'What makes me different',
  'Surprise!',
  'Close call',
  'When I look in the mirror',
  'Confession opportunity!',
  'This one time in the Port-o-Potty',
  'Animals!',
  'Nothing is forever, or is it?',
  'Getting lost',
  'A miracle',
  'The home I grew up in',
  'One of the best days of my life',
  'A missed connection',
  'Best halloween experience',
  'A time I really appreciated women',
  'A time I really appreciated men',
  'A nickname and how I got it',
  'What are you so afraid of?',
  'My favorite achievement so far',
  'How I got this scar',
  'If I were braver than I am now',
  "Regrets, I've had a few, but then again",
  "The story I'm most afraid of telling",
  'When I took it to the limit',
  'Sweet 16',
  'Just in time',
  "Closest to paradise I've ever been",
  'When trust paid off',
  'A blast from the past',
  'Danger',
  'Remarkable courage',
  'What I want to be remembered or known for',
  'My Sanctuary',
  'What is your "catch phrase?"',
  'A decision I made',
  "Something I can't live without",
  'I had an idea',
  'That shit was crazy!',
  'I had no idea',
  'And then, I transcended',
  'The best meal ever!',
  'Stickin it to the Man!',
  'Harsh reality made silly',
  'I was in stitches',
  'If I won the lottery',
  'Awakening',
  'What matters to me',
  'Deja vu',
  'A very weird dream',
  'Serendipitous Synchronicity',
  "I'll never forget it",
  'All about Dad',
  'All about Mom',
  'Just make that shit up!',
  'An unexpected meeting',
  'Freak of Nature',
  'If I could have one superpower',
  'Outlandish Sex Acts',
  'Tear Jerker',
  'God is',
  "Grandma's Cookin'",
  'My Favorite Pet',
  'It was so GREAT, and then it was over.',
  'It Made No Sense',
  'My idea of a good time',
  'Over my head',
  'Beauty Secrets',
  'My Personal Hell',
  'Silence',
  'My Personal Heaven',
  'Letting go',
  'Secret Fetish',
  'Today is not Yesterday',
  'What Makes Me Come Alive',
  'I was dreaming',
  'Anywhere in the World',
  'Best Sex Ever',
  'I Shit My Pants When',
  'An Intelligent Contribution',
  'Something that Fascinates Me',
  'What Turns Me On',
  'My Fairy Tale',
  'How Did I Get Here?',
  'Epiphany',
  'What Grinds My Gears'
];

// Get all prompts with 24+ characters for testing
const LONG_PROMPTS = ALL_PROMPTS.filter(p => p.length >= 24);

// TEST BATCH 2: Next 20 long prompts (index 20-39)
const TEST_BATCH_2 = LONG_PROMPTS.slice(20, 40);

// Shuffle function
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

function App() {
  const [view, setView] = useState('wheel');
  // TEST MODE: Use test batch (long prompts only)
  // NORMAL MODE: Use all prompts shuffled randomly
  const [prompts, setPrompts] = useState(
    TEST_MODE 
      ? TEST_BATCH_2
      : shuffleArray(ALL_PROMPTS)
  );
  
  const [rotation, setRotation] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [animPhase, setAnimPhase] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [selectedPromptForRecording, setSelectedPromptForRecording] = useState(null);
  const [cylinderRadius, setCylinderRadius] = useState(110);
  const [panelHeight, setPanelHeight] = useState(41);
  const [fontSize, setFontSize] = useState(16);
  const [wheelTilt, setWheelTilt] = useState(12);
  
  const velocityRef = useRef(0);
  const rotationRef = useRef(0);
  const animationRef = useRef(null);
  const isCoastingRef = useRef(false);
  const lastInputTimeRef = useRef(0);
  const spinDirectionRef = useRef(1);
  const promptsRef = useRef(prompts.slice(0, 20));
  const wheelContainerRef = useRef(null);
  const wheelRotationRef = useRef(null);
  const isHoveringRef = useRef(false);
  const buttonsContainerRef = useRef(null);
  const [descendY, setDescendY] = useState(0);
  // Track last 10 landed indices to avoid repeats
  const recentLandingsRef = useRef([]);
  // Variable friction for each spin (randomized at spin start)
  const spinFrictionRef = useRef(0.985);
  
  // === RANDOMNESS TEST MODE ===
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const testLandingsRef = useRef([]);
  const testSpinCountRef = useRef(0);
  const testTargetSpinsRef = useRef(0);
  
  // Real-time test state
  const [realTimeTest, setRealTimeTest] = useState(false);
  const [realTimeProgress, setRealTimeProgress] = useState(0);
  const [realTimeTarget, setRealTimeTarget] = useState(0);
  const realTimeLandingsRef = useRef([]);
  const realTimeTestingRef = useRef(false);
  
  // Test panel visibility - toggle with button
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  // Manual tracking mode
  const [manualTracking, setManualTracking] = useState(false);
  const [manualLandings, setManualLandings] = useState([]);
  const [promptLandingCounts, setPromptLandingCounts] = useState({});
  
  // Button press states for image buttons
  const [newTopicsPressed, setNewTopicsPressed] = useState(false);
  const [showElectricity, setShowElectricity] = useState(false);
  const electricCanvasRef = useRef(null);
  const electricAnimFrameRef = useRef(null);
  const electricStateRef = useRef({
    time: 0,
    bolts: [],
    initialized: false
  });
  const [recordPressed, setRecordPressed] = useState(false);
  const [spinPressed, setSpinPressed] = useState(false);
  const [myStoriesPressed, setMyStoriesPressed] = useState(false);
  const [howToPlayPressed, setHowToPlayPressed] = useState(false);
  const [showRecordTooltip, setShowRecordTooltip] = useState(false);
  const [hamburgerPressed, setHamburgerPressed] = useState(false);
  
  // Hamburger menu animation states
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuHasBeenOpened, setMenuHasBeenOpened] = useState(false);
  const [showSmokePoof, setShowSmokePoof] = useState(false);
  const [smokeAnimKey, setSmokeAnimKey] = useState(0);
  const smokeTimeoutRef = useRef(null);
  const smokeDelayTimeoutRef = useRef(null);
  const [hamburgerAnimPhase, setHamburgerAnimPhase] = useState(null);
  const [swayingFromPanel, setSwayingFromPanel] = useState(null);
  const [swayAnimKey, setSwayAnimKey] = useState(0);
  const [showMenuLogo, setShowMenuLogo] = useState(false);
  const logoTimeoutRef = useRef(null);
  
  // Persistent steam effect - spawns wisps that play once and disappear
  const [steamWisps, setSteamWisps] = useState([]);
  const steamIdRef = useRef(0);
  
  // Steam spawn locations - vents only, high density
  const steamLocations = [
    // Top Left Vent - the cross/wheel shaped vent (all openings)
    { id: 'vent-tl-1', left: '26%', top: '11%', type: 'vent' },
    { id: 'vent-tl-2', left: '27.5%', top: '11%', type: 'vent' },
    { id: 'vent-tl-3', left: '29%', top: '13%', type: 'vent' },
    { id: 'vent-tl-4', left: '29%', top: '15%', type: 'vent' },
    { id: 'vent-tl-5', left: '27.5%', top: '17%', type: 'vent' },
    { id: 'vent-tl-6', left: '26%', top: '17%', type: 'vent' },
    { id: 'vent-tl-7', left: '24.5%', top: '15%', type: 'vent' },
    { id: 'vent-tl-8', left: '24.5%', top: '13%', type: 'vent' },
    { id: 'vent-tl-9', left: '27%', top: '14%', type: 'vent' },
    
    // Top Left Vent - slightly to the right (~15px)
    { id: 'vent-tl2-1', left: '28%', top: '11%', type: 'vent' },
    { id: 'vent-tl2-2', left: '29.5%', top: '11%', type: 'vent' },
    { id: 'vent-tl2-3', left: '31%', top: '13%', type: 'vent' },
    { id: 'vent-tl2-4', left: '31%', top: '15%', type: 'vent' },
    { id: 'vent-tl2-5', left: '29.5%', top: '17%', type: 'vent' },
    { id: 'vent-tl2-6', left: '28%', top: '17%', type: 'vent' },
    { id: 'vent-tl2-7', left: '29%', top: '14%', type: 'vent' },
    
    // Bottom Right Vent - horizontal slotted vent (all from openings)
    { id: 'vent-br-1', right: '16%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-2', right: '18%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-3', right: '20%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-4', right: '17%', bottom: '18.75%', type: 'vent' },
    { id: 'vent-br-5', right: '19%', bottom: '18.75%', type: 'vent' },
    { id: 'vent-br-6', right: '21%', bottom: '18.75%', type: 'vent' },
    { id: 'vent-br-7', right: '16.5%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-8', right: '18.5%', bottom: '18.5%', type: 'vent' },
    // First extension left
    { id: 'vent-br-9', right: '22%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-10', right: '24%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-11', right: '23%', bottom: '18.75%', type: 'vent' },
    { id: 'vent-br-12', right: '25%', bottom: '18.75%', type: 'vent' },
    { id: 'vent-br-13', right: '20.5%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-14', right: '22.5%', bottom: '18.5%', type: 'vent' },
    // Second extension left
    { id: 'vent-br-15', right: '26%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-16', right: '27%', bottom: '18.75%', type: 'vent' },
    { id: 'vent-br-17', right: '24.5%', bottom: '18.5%', type: 'vent' },
    { id: 'vent-br-18', right: '26.5%', bottom: '18.5%', type: 'vent' }
  ];
  
  // Spawn steam wisps periodically
  useEffect(() => {
    const spawnSteam = () => {
      // Pick a random location
      const loc = steamLocations[Math.floor(Math.random() * steamLocations.length)];
      const id = steamIdRef.current++;
      const duration = 3800 + Math.random() * 2000;
      const animOptions = ['steamStream', 'steamStreamDrift', 'steamStreamDriftLeft'];
      const animation = animOptions[Math.floor(Math.random() * animOptions.length)];
      
      // Add slight position variation
      const offsetX = (Math.random() - 0.5) * 14;
      const offsetY = (Math.random() - 0.5) * 8;
      
      const newWisp = {
        id,
        ...loc,
        offsetX,
        offsetY,
        duration,
        animation,
        size: 70 + Math.random() * 50,
        createdAt: Date.now()
      };
      
      setSteamWisps(prev => [...prev, newWisp]);
      
      // Remove wisp after animation completes
      setTimeout(() => {
        setSteamWisps(prev => prev.filter(w => w.id !== id));
      }, duration + 100);
    };
    
    // Spawn initial batch - thick coverage across all vents
    for (let i = 0; i < 40; i++) {
      setTimeout(() => spawnSteam(), i * 100 + Math.random() * 120);
    }
    
    // Continue spawning very frequently for persistent thick steam
    let continueSpawning = true;
    const spawnWithRandomDelay = () => {
      if (!continueSpawning) return;
      spawnSteam();
      const nextDelay = 120 + Math.random() * 230; // 120-350ms between spawns
      setTimeout(spawnWithRandomDelay, nextDelay);
    };
    
    // Start the random spawning after initial batch
    const startTimeout = setTimeout(spawnWithRandomDelay, 3000);
    
    return () => {
      continueSpawning = false;
      clearTimeout(startTimeout);
    };
  }, []);
  
  // Phases: 'opening-extrude', 'opening-collapse', 'opening-spin-to-x', 'opening-x-lifted', 'opening-engrave'
  //         'closing-extrude', 'closing-spin-to-line', 'closing-expand', 'closing-engrave'
  const hamburgerAnimatingRef = useRef(false);
  
  // Effect panel controls
  const [showEffectPanel, setShowEffectPanel] = useState(false);
  const [show3xPreview, setShow3xPreview] = useState(false);
  const [effectPage, setEffectPage] = useState(0);
  
  // Debug visibility toggles
  const [hideTopLayer, setHideTopLayer] = useState(false);
  const [hideMiddleLayer, setHideMiddleLayer] = useState(false);
  
  // === EXTRUDED TEXT EFFECT PARAMETERS ===
  
  // Extrusion geometry
  const [extrudeDepth, setExtrudeDepth] = useState(7); // number of layers
  const [extrudeOffsetX, setExtrudeOffsetX] = useState(-0.05); // X offset per layer
  const [extrudeOffsetY, setExtrudeOffsetY] = useState(-0.05); // Y offset per layer
  const [extrudeMaxOffset, setExtrudeMaxOffset] = useState(7); // max depth in pixels
  
  // Extrusion colors (base/darkest)
  const [extrudeBaseR, setExtrudeBaseR] = useState(188);
  const [extrudeBaseG, setExtrudeBaseG] = useState(132);
  const [extrudeBaseB, setExtrudeBaseB] = useState(59);
  
  // Extrusion color step (how much lighter each layer gets)
  const [extrudeStepR, setExtrudeStepR] = useState(17);
  const [extrudeStepG, setExtrudeStepG] = useState(4);
  const [extrudeStepB, setExtrudeStepB] = useState(0);
  
  // Front face gradient
  const [faceTopColor, setFaceTopColor] = useState('#f2dfc0');
  const [faceMidColor, setFaceMidColor] = useState('#e3bf7d');
  const [faceBottomColor, setFaceBottomColor] = useState('#f18741');
  const [faceGradientMidStop, setFaceGradientMidStop] = useState(45); // percentage
  
  // Bevel highlight
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [highlightTopColor, setHighlightTopColor] = useState('#e8d4b8');
  const [highlightTopOpacity, setHighlightTopOpacity] = useState(0.8);
  const [highlightMidColor, setHighlightMidColor] = useState('#d4b892');
  const [highlightMidOpacity, setHighlightMidOpacity] = useState(0.25);
  const [highlightMidStop, setHighlightMidStop] = useState(30); // percentage
  const [highlightBottomColor, setHighlightBottomColor] = useState('#8b7355');
  const [highlightBottomOpacity, setHighlightBottomOpacity] = useState(0.25);
  
  // Text shadow (under the front face)
  const [textShadowEnabled, setTextShadowEnabled] = useState(true);
  const [textShadowOffsetX, setTextShadowOffsetX] = useState(0);
  const [textShadowOffsetY, setTextShadowOffsetY] = useState(2);
  const [textShadowBlur, setTextShadowBlur] = useState(1.5);
  const [textShadowColor, setTextShadowColor] = useState('#1a1008');
  const [textShadowOpacity, setTextShadowOpacity] = useState(1);
  
  // Outer stroke (optional outline around text)
  const [outerStrokeEnabled, setOuterStrokeEnabled] = useState(true);
  const [outerStrokeColor, setOuterStrokeColor] = useState('#523e21');
  const [outerStrokeWidth, setOuterStrokeWidth] = useState(2);
  
  // Texture overlay on text (use button texture)
  const [textureOverlayEnabled, setTextureOverlayEnabled] = useState(true);
  const [textureOverlayOpacity, setTextureOverlayOpacity] = useState(0.85);
  const [textureBlendMode, setTextureBlendMode] = useState('hard-light');
  // Texture gradient mask controls
  const [textureGradientEnabled, setTextureGradientEnabled] = useState(true);
  const [textureGradientType, setTextureGradientType] = useState('horizontal'); // vertical, horizontal, radial
  const [textureGradientTopOpacity, setTextureGradientTopOpacity] = useState(1);
  const [textureGradientMidOpacity, setTextureGradientMidOpacity] = useState(0.7);
  const [textureGradientBottomOpacity, setTextureGradientBottomOpacity] = useState(0.25);
  const [textureGradientMidStop, setTextureGradientMidStop] = useState(50);
  
  // === BUTTON DROP SHADOW (raised effect) ===
  const [buttonShadowEnabled, setButtonShadowEnabled] = useState(true);
  const [buttonShadowOffsetX, setButtonShadowOffsetX] = useState(-5);
  const [buttonShadowOffsetY, setButtonShadowOffsetY] = useState(6);
  const [buttonShadowBlur, setButtonShadowBlur] = useState(17);
  const [buttonShadowSpread, setButtonShadowSpread] = useState(0);
  const [buttonShadowColor, setButtonShadowColor] = useState('#000000');
  const [buttonShadowOpacity, setButtonShadowOpacity] = useState(0.6);
  // Multi-layer shadow for more realistic depth
  const [buttonShadowLayers, setButtonShadowLayers] = useState(4);
  const [buttonShadowLayerMult, setButtonShadowLayerMult] = useState(1.5);
  
  // Generate extrusion layer offsets
  const extrudeLayers = Array.from({length: extrudeDepth}, (_, i) => {
    const t = (extrudeDepth - 1 - i) / (extrudeDepth - 1); // 1 at back, 0 at front
    return {
      offsetX: extrudeMaxOffset * extrudeOffsetX * t,
      offsetY: extrudeMaxOffset * extrudeOffsetY * t,
      r: Math.min(255, extrudeBaseR + extrudeStepR * i),
      g: Math.min(255, extrudeBaseG + extrudeStepG * i),
      b: Math.min(255, extrudeBaseB + extrudeStepB * i)
    };
  });
  
  // Generate button shadow CSS
  const buttonShadowStyle = buttonShadowEnabled ? {
    filter: Array.from({length: buttonShadowLayers}, (_, i) => {
      const mult = Math.pow(buttonShadowLayerMult, i);
      const y = buttonShadowOffsetY * mult;
      const blur = buttonShadowBlur * mult;
      const opacity = buttonShadowOpacity * (1 - i * 0.2);
      return `drop-shadow(${buttonShadowOffsetX}px ${y}px ${blur}px rgba(0,0,0,${opacity}))`;
    }).join(' ')
  } : {};
  
  // Pressed button shadow - slightly reduced Y and more transparent for "pushed in" effect
  const buttonShadowPressedStyle = buttonShadowEnabled ? {
    filter: Array.from({length: buttonShadowLayers}, (_, i) => {
      const mult = Math.pow(buttonShadowLayerMult, i);
      const y = buttonShadowOffsetY * 0.4 * mult; // Reduced Y offset
      const blur = buttonShadowBlur * 0.7 * mult; // Slightly less blur
      const opacity = buttonShadowOpacity * 0.6 * (1 - i * 0.2); // More transparent
      return `drop-shadow(${buttonShadowOffsetX * 0.5}px ${y}px ${blur}px rgba(0,0,0,${opacity}))`;
    }).join(' ')
  } : {};
  
  // Fast test spin - simulates physics without animation
  const runTestSpin = () => {
    // Random prompt-aligned offset
    const randomPromptOffset = Math.floor(Math.random() * 20) * 18;
    const partialOffset = Math.random() * 17;
    let testRotation = rotationRef.current + randomPromptOffset + partialOffset;
    
    // Simulate physics
    const friction = 0.982 + Math.random() * 0.006;
    let velocity = -(40 + Math.random() * 35);
    
    // Run physics simulation until velocity drops
    while (Math.abs(velocity) >= 1.5) {
      velocity *= friction;
      testRotation += velocity;
    }
    
    // Calculate which prompt we landed on
    const promptInterval = 18;
    const spinDirection = -1;
    const currentPromptIndex = testRotation / promptInterval;
    const targetIndex = Math.floor(currentPromptIndex);
    const finalRotation = targetIndex * promptInterval;
    
    // Get selected index (matching the real wheel logic)
    const currentTilt = 15;
    let adjustedRotation = finalRotation + currentTilt;
    let normalizedRotation = adjustedRotation % 360;
    if (normalizedRotation < 0) normalizedRotation += 360;
    let selectedIndex = Math.round(normalizedRotation / 18) % 20;
    if (selectedIndex >= 20) selectedIndex = 0;
    if (selectedIndex < 0) selectedIndex = 19;
    
    // Update rotation for next spin
    rotationRef.current = finalRotation;
    
    return selectedIndex;
  };
  
  // Calculate and display results from landings array
  const calculateResults = (landings, totalSpins) => {
    const landingCounts = new Array(20).fill(0);
    landings.forEach(idx => landingCounts[idx]++);
    
    const promptsHit = landingCounts.filter(c => c > 0).length;
    const promptsNotHit = 20 - promptsHit;
    const maxHits = Math.max(...landingCounts);
    const minHitsArr = landingCounts.filter(c => c > 0);
    const minHits = minHitsArr.length > 0 ? Math.min(...minHitsArr) : 0;
    const avgHits = totalSpins / 20;
    
    return {
      totalSpins,
      promptsHit,
      promptsNotHit,
      landingCounts,
      maxHits,
      minHits,
      avgHits,
      distribution: landingCounts.map((count, idx) => ({
        index: idx,
        count,
        percent: ((count / totalSpins) * 100).toFixed(1)
      }))
    };
  };
  
  // Run full simulated test (instant)
  const runRandomnessTest = (numSpins) => {
    testLandingsRef.current = [];
    const newLandingCounts = {};
    
    for (let i = 0; i < numSpins; i++) {
      const landedIndex = runTestSpin();
      testLandingsRef.current.push(landedIndex);
      
      // Track by prompt text for display
      const landedPrompt = promptsRef.current[landedIndex];
      if (landedPrompt) {
        newLandingCounts[landedPrompt] = (newLandingCounts[landedPrompt] || 0) + 1;
      }
    }
    
    // Update the prompt landing counts for display
    setPromptLandingCounts(newLandingCounts);
    setManualLandings(testLandingsRef.current.map(idx => promptsRef.current[idx]));
    
    const results = calculateResults(testLandingsRef.current, numSpins);
    setTestResults({ ...results, type: 'simulated' });
    
    console.log('=== SIMULATED TEST RESULTS ===');
    console.log('Total spins:', numSpins);
    console.log('Prompts hit:', results.promptsHit, '/ 20');
    console.log('Distribution:', results.landingCounts);
  };
  
  // Start real-time test
  const startRealTimeTest = (numSpins) => {
    if (realTimeTestingRef.current) return;
    
    realTimeLandingsRef.current = [];
    realTimeTestingRef.current = true;
    setRealTimeTest(true);
    setRealTimeProgress(0);
    setRealTimeTarget(numSpins);
    setTestResults(null);
    
    // Reset landing counts for fresh tracking
    setPromptLandingCounts({});
    setManualLandings([]);
    
    // Clear any existing selection and trigger first spin
    setSelectedPrompt(null);
    setAnimPhase(null);
    
    // Small delay then start first spin
    setTimeout(() => {
      buttonSpin();
    }, 300);
  };
  
  // Stop real-time test
  const stopRealTimeTest = () => {
    realTimeTestingRef.current = false;
    setRealTimeTest(false);
    
    if (realTimeLandingsRef.current.length > 0) {
      const results = calculateResults(realTimeLandingsRef.current, realTimeLandingsRef.current.length);
      setTestResults({ ...results, type: 'realtime' });
    }
  };
  
  // Effect to handle real-time test progression
  useEffect(() => {
    if (!realTimeTestingRef.current) return;
    if (!selectedPrompt) return;
    
    // Record the landing
    const landedIndex = promptsRef.current.indexOf(selectedPrompt);
    if (landedIndex !== -1) {
      realTimeLandingsRef.current.push(landedIndex);
      setRealTimeProgress(realTimeLandingsRef.current.length);
      
      // Update landing counts for display
      setPromptLandingCounts(prev => ({
        ...prev,
        [selectedPrompt]: (prev[selectedPrompt] || 0) + 1
      }));
      setManualLandings(prev => [...prev, selectedPrompt]);
      
      console.log(`Real-time test: Spin ${realTimeLandingsRef.current.length}/${realTimeTarget} landed on index ${landedIndex}`);
    }
    
    // Check if done
    if (realTimeLandingsRef.current.length >= realTimeTarget) {
      realTimeTestingRef.current = false;
      setRealTimeTest(false);
      
      const results = calculateResults(realTimeLandingsRef.current, realTimeTarget);
      setTestResults({ ...results, type: 'realtime' });
      
      console.log('=== REAL-TIME TEST COMPLETE ===');
      console.log('Distribution:', results.landingCounts);
      return;
    }
    
    // Wait for animation to complete, then spin again
    // selectedPrompt is set, but we need to wait for animPhase to finish
    const waitAndSpin = () => {
      setTimeout(() => {
        if (!realTimeTestingRef.current) return;
        
        // Clear selection and spin again
        setSelectedPrompt(null);
        setAnimPhase(null);
        
        setTimeout(() => {
          if (realTimeTestingRef.current) {
            buttonSpin();
          }
        }, 500);
      }, 2000); // Wait 2 seconds after landing before next spin
    };
    
    waitAndSpin();
  }, [selectedPrompt, realTimeTarget]);
  
  // Effect to track manual spins - detect when wheel stops on a prompt
  const lastTrackedPromptRef = useRef(null);
  const spinCompletedRef = useRef(false);
  
  // Reset tracking flag when a new spin starts (selectedPrompt becomes null)
  useEffect(() => {
    if (!selectedPrompt) {
      spinCompletedRef.current = false;
    }
  }, [selectedPrompt]);
  
  // Track when spin completes (enters hold phase)
  useEffect(() => {
    if (!manualTracking) return;
    if (!selectedPrompt) return;
    if (animPhase !== 'hold') return;
    if (spinCompletedRef.current) return; // Already tracked this spin
    
    // Mark this spin as tracked
    spinCompletedRef.current = true;
    lastTrackedPromptRef.current = selectedPrompt;
    
    // Record this landing
    setManualLandings(prev => [...prev, selectedPrompt]);
    setPromptLandingCounts(prev => ({
      ...prev,
      [selectedPrompt]: (prev[selectedPrompt] || 0) + 1
    }));
    
    console.log(`Manual tracking: Landed on "${selectedPrompt}"`);
  }, [selectedPrompt, manualTracking, animPhase]);
  
  // Start manual tracking
  const startManualTracking = () => {
    setManualTracking(true);
    setManualLandings([]);
    setPromptLandingCounts({});
    setTestResults(null);
  };
  
  // Stop manual tracking and show results
  const stopManualTracking = () => {
    setManualTracking(false);
    
    if (manualLandings.length > 0) {
      // Calculate results based on prompt indices
      const landingIndices = manualLandings.map(p => promptsRef.current.indexOf(p));
      const results = calculateResults(landingIndices, manualLandings.length);
      setTestResults({ ...results, type: 'manual' });
    }
  };
  
  // Reset manual tracking
  const resetManualTracking = () => {
    setManualLandings([]);
    setPromptLandingCounts({});
    setTestResults(null);
  };
  
  // Track which prompts have been shown on the wheel
  const usedPromptsRef = useRef(new Set(prompts.slice(0, 20)));
  
  // Load new topics - picks 20 unused prompts, resets if all used
  
  // ========== ELECTRICITY ANIMATION SYSTEM ==========
  // === TUNING KNOBS - Adjust these for visual quality ===
  const ELECTRICITY_CONFIG = {
    // Bolt structure - 12-20 arcs radiating from center
    numMainBolts: 18,              // Dense radial bolt count
    boltThicknessMin: 0.5,         // Main bolt thickness range
    boltThicknessMax: 0.9,
    branchThicknessMin: 0.25,      // Branch thickness (thinner)
    branchThicknessMax: 0.45,
    branchesPerBoltMin: 6,         // Irregular branching
    branchesPerBoltMax: 12,
    subBranchChance: 0.65,         // Sub-branch probability
    
    // Animation speeds
    boltSpeedMin: 2.0,
    boltSpeedMax: 4.0,
    jitterSpeedMin: 5.0,
    jitterSpeedMax: 10.0,
    microFlickerAmount: 0.25,      // Per-frame thickness variation
    
    // Per-bolt opacity animation (appear/disappear dynamically)
    boltFadeInSpeed: 0.08,         // How fast bolts fade in
    boltFadeOutSpeed: 0.05,        // How fast bolts fade out
    boltOnDurationMin: 0.3,        // Min time bolt stays visible (seconds)
    boltOnDurationMax: 1.2,        // Max time bolt stays visible
    boltOffDurationMin: 0.1,       // Min time bolt stays hidden
    boltOffDurationMax: 0.6,       // Max time bolt stays hidden
    
    // Energy surge cycles (3-second cycles: build, peak, calm)
    surgeCycleDuration: 3.0,       // Full cycle in seconds
    surgeBuildPhase: 0.4,          // 0-40%: energy builds
    surgePeakPhase: 0.6,           // 40-60%: peak intensity
    // 60-100%: calm phase
    surgePeakBrightness: 1.35,     // Brightness multiplier at peak
    surgePeakWidth: 1.25,          // Bolt width multiplier at peak
    surgeBaseBrightness: 0.85,     // Brightness during calm
    
    // Central glow with 2Hz pulse
    centerPulseFrequency: 2.0,     // Hz - pulses per second
    centerPulseAmount: 0.2,        // Pulse intensity variation
    
    // Plasma volumetric layer
    plasmaDensity: 0.5,            // Overall plasma opacity
    plasmaSwirlSpeed: 0.15,        // Noise animation speed
    plasmaCenterBrightness: 0.8,   // Extra glow at center
    plasmaNoiseScale: 2.2,         // Noise frequency
    
    // Multi-scale bloom with rim emphasis
    bloomTightRadius: 2.5,         // Sharp inner glow
    bloomMedRadius: 6.0,           // Medium spread
    bloomWideRadius: 12.0,         // Wide atmospheric halo
    bloomTightWeight: 0.5,
    bloomMedWeight: 0.32,
    bloomWideWeight: 0.18,
    rimBloomBoost: 1.4,            // Extra bloom near ring edge
    
    // Colors - Golden-amber (#ffb836 core → #ff9100 falloff)
    coreColor: [1.0, 0.72, 0.21],     // #ffb836 golden core
    midColor: [1.0, 0.57, 0.0],       // #ff9100 orange mid
    outerColor: [0.9, 0.4, 0.0],      // Deep amber outer
    plasmaInner: [1.0, 0.65, 0.15],   // Bright golden fog center
    plasmaOuter: [0.8, 0.35, 0.0],    // Deep amber fog edge
    
    // Glass reflection layer
    glassOpacity: 0.12,            // Subtle glass overlay
    glassReflectionStrength: 0.08, // Reflection highlight
    glassBlur: 0.5,                // Slight blur for depth
    
    // Compositing
    globalIntensity: 1.0,
    toneMapExposure: 1.5,          // HDR exposure multiplier
    portalRadius: 0.47,            // Slightly tighter containment
    centerGlowStrength: 0.35       // Warm center ambient
  };
  
  // SimplexNoise implementation for organic movement
  const createNoise = () => {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    
    const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    
    return (x, y) => {
      const s = (x + y) * F2;
      const i = Math.floor(x + s);
      const j = Math.floor(y + s);
      const t = (i + j) * G2;
      const X0 = i - t, Y0 = j - t;
      const x0 = x - X0, y0 = y - Y0;
      const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;
      
      let n0 = 0, n1 = 0, n2 = 0;
      let t0 = 0.5 - x0*x0 - y0*y0;
      if (t0 >= 0) {
        t0 *= t0;
        const gi0 = perm[ii + perm[jj]] % 12;
        n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
      }
      let t1 = 0.5 - x1*x1 - y1*y1;
      if (t1 >= 0) {
        t1 *= t1;
        const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
        n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
      }
      let t2 = 0.5 - x2*x2 - y2*y2;
      if (t2 >= 0) {
        t2 *= t2;
        const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
        n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
      }
      return 70 * (n0 + n1 + n2);
    };
  };
  
  // Fractal noise for smoother organic displacement
  const fractalNoise = (noise, x, y, octaves = 4) => {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += amplitude * noise(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / maxValue;
  };
  
  // Initialize persistent bolt structure - PURELY RADIAL with dense branching
  const initializeBolts = () => {
    const bolts = [];
    const cfg = ELECTRICITY_CONFIG;
    
    // Main radial bolts from center (denser starburst)
    const numRadialBolts = cfg.numMainBolts;
    for (let i = 0; i < numRadialBolts; i++) {
      const angle = (i / numRadialBolts) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const length = 170 + Math.random() * 25;
      const seed = Math.random() * 1000;
      const thickness = cfg.boltThicknessMin + Math.random() * (cfg.boltThicknessMax - cfg.boltThicknessMin);
      const speed = cfg.boltSpeedMin + Math.random() * (cfg.boltSpeedMax - cfg.boltSpeedMin);
      
      // Dense branching for organic look
      const branches = [];
      const numBranches = cfg.branchesPerBoltMin + Math.floor(Math.random() * (cfg.branchesPerBoltMax - cfg.branchesPerBoltMin));
      for (let b = 0; b < numBranches; b++) {
        const branchT = 0.08 + (b / numBranches) * 0.78;
        const branchThickness = cfg.branchThicknessMin + Math.random() * (cfg.branchThicknessMax - cfg.branchThicknessMin);
        branches.push({
          startT: branchT + (Math.random() - 0.5) * 0.06,
          angle: angle + (Math.random() - 0.5) * 1.4,
          length: 18 + Math.random() * 50,
          seed: Math.random() * 1000,
          thickness: branchThickness,
          speed: 3.5 + Math.random() * 2.5,
          subBranches: Math.random() < cfg.subBranchChance ? [
            {
              startT: 0.25 + Math.random() * 0.45,
              angleOffset: (Math.random() - 0.5) * 0.9,
              length: 8 + Math.random() * 22,
              seed: Math.random() * 1000,
              thickness: branchThickness * 0.6
            },
            // Extra sub-branch for density
            Math.random() > 0.4 ? {
              startT: 0.5 + Math.random() * 0.3,
              angleOffset: (Math.random() - 0.5) * 0.7,
              length: 6 + Math.random() * 15,
              seed: Math.random() * 1000,
              thickness: branchThickness * 0.45
            } : null
          ].filter(Boolean) : []
        });
      }
      
      bolts.push({ 
        type: 'radial',
        angle, length, seed, thickness, speed, branches, 
        noise: createNoise(),
        jitterSpeed: cfg.jitterSpeedMin + Math.random() * (cfg.jitterSpeedMax - cfg.jitterSpeedMin),
        // Per-bolt opacity animation state
        opacity: Math.random() > 0.3 ? 1.0 : 0.0, // Start some visible, some hidden
        targetOpacity: 1.0,
        fadeSpeed: cfg.boltFadeInSpeed + Math.random() * 0.04,
        nextToggleTime: Math.random() * cfg.boltOnDurationMax, // Random initial delay
        isVisible: Math.random() > 0.3
      });
    }
    
    return bolts;
  };
  
  // Update per-bolt opacity animation (appear/disappear dynamically)
  const updateBoltOpacities = (bolts, deltaTime, surgeMultiplier) => {
    const cfg = ELECTRICITY_CONFIG;
    bolts.forEach(bolt => {
      bolt.nextToggleTime -= deltaTime;
      
      if (bolt.nextToggleTime <= 0) {
        // Toggle visibility state
        bolt.isVisible = !bolt.isVisible;
        bolt.targetOpacity = bolt.isVisible ? 1.0 : 0.0;
        
        // Set next toggle time
        if (bolt.isVisible) {
          bolt.nextToggleTime = cfg.boltOnDurationMin + Math.random() * (cfg.boltOnDurationMax - cfg.boltOnDurationMin);
          bolt.fadeSpeed = cfg.boltFadeInSpeed + Math.random() * 0.04;
        } else {
          bolt.nextToggleTime = cfg.boltOffDurationMin + Math.random() * (cfg.boltOffDurationMax - cfg.boltOffDurationMin);
          bolt.fadeSpeed = cfg.boltFadeOutSpeed + Math.random() * 0.03;
        }
      }
      
      // Smooth opacity transition
      const opacityDiff = bolt.targetOpacity - bolt.opacity;
      bolt.opacity += opacityDiff * bolt.fadeSpeed * surgeMultiplier;
      bolt.opacity = Math.max(0, Math.min(1, bolt.opacity));
    });
  };
  
  // Flash arc - quick bright arcs (kept but simplified)
  const flashArcsRef = useRef([]);
  
  const spawnFlashArc = (centerX, centerY) => {
    // Simpler radial flash, not crossing
    const angle = Math.random() * Math.PI * 2;
    const length = 100 + Math.random() * 80;
    
    const arc = {
      id: Date.now() + Math.random(),
      angle,
      length,
      thickness: 0.6 + Math.random() * 0.8,
      birth: Date.now(),
      lifespan: 60 + Math.random() * 100,
      noise: createNoise(),
      seed: Math.random() * 1000
    };
    
    flashArcsRef.current.push(arc);
  };
  
  // Generate animated bolt path using noise (called every frame) - sharp zigzag
  const generateAnimatedPath = (bolt, time, centerX, centerY) => {
    const points = [];
    const segments = 18; // More segments for jagged look
    const cosA = Math.cos(bolt.angle);
    const sinA = Math.sin(bolt.angle);
    const perpX = -sinA;
    const perpY = cosA;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const baseX = centerX + cosA * bolt.length * t;
      const baseY = centerY + sinA * bolt.length * t;
      
      // Sharp zigzag displacement
      const noiseVal = fractalNoise(bolt.noise, t * 5 + time * bolt.speed, bolt.seed);
      const jitter = fractalNoise(bolt.noise, t * 10 + time * bolt.jitterSpeed, bolt.seed + 500) * 0.4;
      const taper = Math.sin(t * Math.PI);
      const displacement = (noiseVal + jitter) * bolt.length * 0.25 * taper;
      
      points.push({
        x: baseX + perpX * displacement,
        y: baseY + perpY * displacement
      });
    }
    return points;
  };
  
  // Generate branch path
  const generateBranchPath = (startPoint, branch, time, noise) => {
    const points = [startPoint];
    const segments = 8;
    const cosB = Math.cos(branch.angle);
    const sinB = Math.sin(branch.angle);
    const perpBX = -sinB;
    const perpBY = cosB;
    
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const baseX = startPoint.x + cosB * branch.length * t;
      const baseY = startPoint.y + sinB * branch.length * t;
      const noiseVal = fractalNoise(noise, t * 4 + time * branch.speed + branch.seed, branch.seed);
      const taper = Math.sin(t * Math.PI);
      const displacement = noiseVal * branch.length * 0.3 * taper;
      points.push({
        x: baseX + perpBX * displacement,
        y: baseY + perpBY * displacement
      });
    }
    return points;
  };
  
  // Generate flash bolt path (simple radial)
  const generateFlashPath = (arc, time, centerX, centerY) => {
    const points = [];
    const segments = 10;
    const cosA = Math.cos(arc.angle);
    const sinA = Math.sin(arc.angle);
    const perpX = -sinA;
    const perpY = cosA;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const baseX = centerX + cosA * arc.length * t;
      const baseY = centerY + sinA * arc.length * t;
      const noiseVal = fractalNoise(arc.noise, t * 6 + time * 5, arc.seed);
      const taper = Math.sin(t * Math.PI);
      const displacement = noiseVal * arc.length * 0.25 * taper;
      points.push({
        x: baseX + perpX * displacement,
        y: baseY + perpY * displacement
      });
    }
    return points;
  };
  
  // WebGL electricity rendering with contained bloom
  React.useEffect(() => {
    if (!showElectricity || !electricCanvasRef.current) return;
    
    const canvas = electricCanvasRef.current;
    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false,
      antialias: true 
    });
    
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    
    const state = electricStateRef.current;
    const centerX = 200, centerY = 200;
    const resolution = 400;
    
    // Initialize bolts on first run
    if (!state.initialized) {
      state.bolts = initializeBolts();
      state.time = 0;
      state.startTime = Date.now();
      state.initialized = true;
      flashArcsRef.current = [];
    }
    
    // === WebGL Shader Sources ===
    const boltVertexShader = `
      attribute vec2 a_position;
      attribute float a_alpha;
      varying float v_alpha;
      uniform vec2 u_resolution;
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_alpha = a_alpha;
      }
    `;
    
    const boltFragmentShader = `
      precision mediump float;
      varying float v_alpha;
      uniform vec3 u_coreColor;
      uniform vec3 u_midColor;
      uniform vec3 u_outerColor;
      uniform float u_intensity;
      void main() {
        // Gradient from hot cream core to amber outer based on alpha
        float coreFactor = smoothstep(0.3, 0.9, v_alpha);
        vec3 innerMix = mix(u_midColor, u_coreColor, coreFactor);
        vec3 finalColor = mix(u_outerColor, innerMix, v_alpha);
        gl_FragColor = vec4(finalColor * u_intensity * 1.2, v_alpha * u_intensity);
      }
    `;
    
    const blurVertexShader = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `;
    
    const blurFragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_texture;
      uniform vec2 u_direction;
      uniform vec2 u_resolution;
      uniform float u_radius;
      
      void main() {
        vec4 sum = vec4(0.0);
        vec2 texelSize = 1.0 / u_resolution;
        
        // 9-tap Gaussian blur
        float weights[5];
        weights[0] = 0.227027;
        weights[1] = 0.1945946;
        weights[2] = 0.1216216;
        weights[3] = 0.054054;
        weights[4] = 0.016216;
        
        sum += texture2D(u_texture, v_texCoord) * weights[0];
        
        for (int i = 1; i < 5; i++) {
          vec2 offset = u_direction * texelSize * float(i) * u_radius;
          sum += texture2D(u_texture, v_texCoord + offset) * weights[i];
          sum += texture2D(u_texture, v_texCoord - offset) * weights[i];
        }
        
        gl_FragColor = sum;
      }
    `;
    
    // === VOLUMETRIC PLASMA SHADER - Creates warm atmospheric glow ===
    const plasmaFragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_center;
      uniform float u_intensity;
      uniform float u_density;
      uniform float u_centerBright;
      uniform float u_noiseScale;
      uniform vec3 u_innerColor;
      uniform vec3 u_outerColor;
      uniform float u_portalRadius;
      
      // Simplex-like noise for swirling plasma
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289v2(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      // Fractal noise for richer texture
      float fbm(vec2 p, float time) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 4; i++) {
          value += amplitude * snoise(p * frequency + time * 0.3 * float(i + 1));
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }
      
      void main() {
        vec2 pos = v_texCoord - u_center;
        float dist = length(pos);
        
        // Portal mask - soft edge
        float portalMask = 1.0 - smoothstep(u_portalRadius * 0.75, u_portalRadius, dist);
        if (portalMask < 0.01) {
          gl_FragColor = vec4(0.0);
          return;
        }
        
        // Radial density falloff - denser at center
        float radialDensity = 1.0 - smoothstep(0.0, u_portalRadius * 0.9, dist);
        radialDensity = pow(radialDensity, 0.7); // Softer falloff
        
        // Swirling noise animation
        vec2 noiseCoord = pos * u_noiseScale;
        float swirl = fbm(noiseCoord, u_time) * 0.5 + 0.5;
        
        // Rotating motion
        float angle = atan(pos.y, pos.x);
        float rotateNoise = snoise(vec2(angle * 2.0 + u_time * 0.5, dist * 3.0)) * 0.3;
        swirl += rotateNoise;
        swirl = clamp(swirl, 0.0, 1.0);
        
        // Center brightness boost
        float centerGlow = exp(-dist * 5.0) * u_centerBright;
        
        // Color gradient from inner (bright golden) to outer (deep amber)
        float colorMix = smoothstep(0.0, u_portalRadius * 0.7, dist);
        vec3 plasmaColor = mix(u_innerColor, u_outerColor, colorMix);
        
        // Combine all factors
        float alpha = (radialDensity * u_density + centerGlow) * swirl * portalMask * u_intensity;
        alpha = clamp(alpha * 0.5, 0.0, 0.6); // Cap alpha for subtlety
        
        gl_FragColor = vec4(plasmaColor * (1.0 + centerGlow * 0.5), alpha);
      }
    `;
    
    const compositeFragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_bolts;
      uniform sampler2D u_plasma;
      uniform sampler2D u_bloomTight;
      uniform sampler2D u_bloomMed;
      uniform sampler2D u_bloomWide;
      uniform float u_intensity;
      uniform vec2 u_center;
      uniform float u_portalRadius;
      uniform float u_bloomTightWeight;
      uniform float u_bloomMedWeight;
      uniform float u_bloomWideWeight;
      uniform float u_exposure;
      uniform float u_centerGlow;
      uniform float u_centerPulse;
      uniform float u_rimBloomBoost;
      uniform float u_glassOpacity;
      uniform float u_glassReflection;
      uniform vec3 u_ambientColor;
      
      // ACES Filmic Tone Mapping
      vec3 ACESFilm(vec3 x) {
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
      }
      
      void main() {
        vec2 pos = v_texCoord - u_center;
        float dist = length(pos);
        
        // Circular mask with soft edge - tighter containment
        float portalMask = 1.0 - smoothstep(u_portalRadius * 0.80, u_portalRadius * 0.95, dist);
        
        // Rim factor for bloom boost near edge (light contained by metal edge)
        float rimFactor = smoothstep(u_portalRadius * 0.55, u_portalRadius * 0.85, dist);
        float rimBoost = 1.0 + rimFactor * (u_rimBloomBoost - 1.0);
        
        // Get all layers
        vec4 plasmaColor = texture2D(u_plasma, v_texCoord);
        vec4 boltColor = texture2D(u_bolts, v_texCoord);
        vec4 bloomTight = texture2D(u_bloomTight, v_texCoord);
        vec4 bloomMed = texture2D(u_bloomMed, v_texCoord);
        vec4 bloomWide = texture2D(u_bloomWide, v_texCoord);
        
        // Multi-scale bloom composite with rim boost
        vec4 totalBloom = (bloomTight * u_bloomTightWeight + 
                          bloomMed * u_bloomMedWeight + 
                          bloomWide * u_bloomWideWeight) * rimBoost;
        
        // Layer compositing: plasma base + bolts + bloom (additive)
        vec3 hdrColor = plasmaColor.rgb * plasmaColor.a;
        hdrColor += boltColor.rgb;
        hdrColor += totalBloom.rgb * 1.9;
        
        // Warm center ambient glow with 2Hz pulse
        float centerFactor = (1.0 - smoothstep(0.0, 0.42, dist)) * u_centerGlow * u_intensity * u_centerPulse;
        hdrColor += u_ambientColor * centerFactor;
        
        // Apply exposure for HDR feel
        hdrColor *= u_exposure;
        
        // ACES tone mapping for filmic look
        vec3 toneMapped = ACESFilm(hdrColor);
        
        // === GLASS REFLECTION LAYER ===
        // Subtle semi-transparent glass overlay - appears inside the porthole
        float glassGradient = smoothstep(0.0, u_portalRadius * 0.7, dist);
        
        // Glass reflection highlight (curved surface catch light)
        vec2 reflectDir = normalize(pos);
        float reflectionAngle = dot(reflectDir, vec2(0.3, -0.5)); // Light from upper-left
        float reflection = pow(max(0.0, reflectionAngle), 3.0) * u_glassReflection;
        
        // Glass tint - very subtle blue-white
        vec3 glassColor = vec3(0.95, 0.97, 1.0);
        
        // Apply glass layer over lightning
        toneMapped = mix(toneMapped, toneMapped + glassColor * reflection, portalMask * u_glassOpacity);
        
        // Slight desaturation through glass for depth
        float luminance = dot(toneMapped, vec3(0.299, 0.587, 0.114));
        toneMapped = mix(toneMapped, vec3(luminance) * vec3(1.0, 0.98, 0.95), u_glassOpacity * 0.15);
        
        // Calculate alpha from all layers
        float alpha = max(plasmaColor.a, max(boltColor.a, totalBloom.a * 0.85));
        alpha = max(alpha, centerFactor * 0.7);
        alpha *= portalMask * u_intensity;
        
        // Glass adds slight alpha coverage
        alpha = max(alpha, portalMask * u_glassOpacity * 0.3);
        
        gl_FragColor = vec4(toneMapped, alpha);
      }
    `;
    
    // === Shader Compilation Helpers ===
    const compileShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    
    const createProgram = (vertexSource, fragmentSource) => {
      const vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
      const fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    };
    
    // === Create Programs ===
    const boltProgram = createProgram(boltVertexShader, boltFragmentShader);
    const blurProgram = createProgram(blurVertexShader, blurFragmentShader);
    const plasmaProgram = createProgram(blurVertexShader, plasmaFragmentShader);
    const compositeProgram = createProgram(blurVertexShader, compositeFragmentShader);
    
    // === Create Framebuffers and Textures ===
    const createFramebuffer = () => {
      const fb = gl.createFramebuffer();
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution, resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { framebuffer: fb, texture: tex };
    };
    
    // Framebuffers for multi-pass rendering
    const plasmaFB = createFramebuffer();      // Volumetric plasma layer
    const boltsFB = createFramebuffer();       // Raw bolt geometry
    const blurFB1 = createFramebuffer();       // Blur pass temp
    const blurFB2 = createFramebuffer();       // Blur pass temp
    const bloomTightFB = createFramebuffer();  // Tight bloom (sharp glow)
    const bloomMedFB = createFramebuffer();    // Medium bloom
    const bloomWideFB = createFramebuffer();   // Wide bloom (atmospheric)
    
    // === Fullscreen Quad for Post-Processing ===
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
       1,  1, 1, 1
    ]), gl.STATIC_DRAW);
    
    // === Bolt Vertex Buffer ===
    const boltBuffer = gl.createBuffer();
    
    // === Render Function ===
    let lastFrameTime = Date.now();
    
    const render = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastFrameTime) / 1000; // seconds
      lastFrameTime = currentTime;
      
      state.time += 0.03;
      const elapsed = currentTime - state.startTime;
      const elapsedSec = elapsed / 1000;
      const cfg = ELECTRICITY_CONFIG;
      
      // === SURGE CYCLE: 3-second cycles (build, peak, calm) ===
      const cyclePosition = (elapsedSec % cfg.surgeCycleDuration) / cfg.surgeCycleDuration;
      let surgeMultiplier;
      if (cyclePosition < cfg.surgeBuildPhase) {
        // Build phase: 0 to buildPhase - energy increases
        const buildProgress = cyclePosition / cfg.surgeBuildPhase;
        surgeMultiplier = cfg.surgeBaseBrightness + (cfg.surgePeakBrightness - cfg.surgeBaseBrightness) * (buildProgress * buildProgress);
      } else if (cyclePosition < cfg.surgePeakPhase) {
        // Peak phase: buildPhase to peakPhase - max intensity
        surgeMultiplier = cfg.surgePeakBrightness;
      } else {
        // Calm phase: peakPhase to 1.0 - energy decreases
        const calmProgress = (cyclePosition - cfg.surgePeakPhase) / (1.0 - cfg.surgePeakPhase);
        surgeMultiplier = cfg.surgePeakBrightness - (cfg.surgePeakBrightness - cfg.surgeBaseBrightness) * calmProgress;
      }
      
      // === 2Hz CENTER PULSE ===
      const pulsePhase = elapsedSec * cfg.centerPulseFrequency * Math.PI * 2;
      const centerPulse = 1.0 + Math.sin(pulsePhase) * cfg.centerPulseAmount;
      
      // === WIDTH MULTIPLIER during surge peaks ===
      const widthMultiplier = cyclePosition >= cfg.surgeBuildPhase && cyclePosition < cfg.surgePeakPhase 
        ? cfg.surgePeakWidth 
        : 1.0 + (surgeMultiplier - cfg.surgeBaseBrightness) * 0.3;
      
      // Calculate base intensity with timing (overall animation envelope)
      let intensity;
      if (elapsed < 350) {
        const buildUp = elapsed / 350;
        intensity = buildUp * buildUp;
      } else if (elapsed < 1800) {
        intensity = 1;
      } else if (elapsed < 2200) {
        const fadeProgress = (elapsed - 1800) / 400;
        intensity = 1 - (fadeProgress * fadeProgress);
      } else {
        intensity = 0;
      }
      
      // Apply surge to intensity
      const finalIntensity = intensity * surgeMultiplier;
      
      if (intensity <= 0.01 && elapsed > 2000) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }
      
      // === UPDATE PER-BOLT OPACITIES (appear/disappear dynamically) ===
      updateBoltOpacities(state.bolts, deltaTime, surgeMultiplier);
      
      // Spawn flash bolts - more during surge peaks
      const flashChance = cyclePosition < cfg.surgePeakPhase ? 0.09 : 0.04;
      if (elapsed < 1800 && Math.random() < flashChance * intensity) {
        spawnFlashArc(centerX, centerY);
      }
      
      // Clean expired flash arcs
      const now = Date.now();
      flashArcsRef.current = flashArcsRef.current.filter(arc => now - arc.birth < arc.lifespan);
      
      // === PASS 1: Render bolts to texture ===
      gl.bindFramebuffer(gl.FRAMEBUFFER, boltsFB.framebuffer);
      gl.viewport(0, 0, resolution, resolution);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      
      gl.useProgram(boltProgram);
      const posLoc = gl.getAttribLocation(boltProgram, 'a_position');
      const alphaLoc = gl.getAttribLocation(boltProgram, 'a_alpha');
      const resLoc = gl.getUniformLocation(boltProgram, 'u_resolution');
      const coreColorLoc = gl.getUniformLocation(boltProgram, 'u_coreColor');
      const midColorLoc = gl.getUniformLocation(boltProgram, 'u_midColor');
      const outerColorLoc = gl.getUniformLocation(boltProgram, 'u_outerColor');
      const intensityLoc = gl.getUniformLocation(boltProgram, 'u_intensity');
      
      gl.uniform2f(resLoc, resolution, resolution);
      
      // Collect all bolt segments
      const segments = [];
      const flickerCfg = ELECTRICITY_CONFIG.microFlickerAmount;
      
      const addBoltPath = (points, thickness, isMain, boltOpacity = 1.0) => {
        if (points.length < 2) return;
        // Micro-flicker: per-segment thickness variation
        const flicker = 1.0 + (Math.random() - 0.5) * flickerCfg;
        // Apply surge width multiplier
        const baseW = thickness * flicker * widthMultiplier * (isMain ? 2.0 : 1.4);
        
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < 0.1) continue;
          const nx = -dy / len;
          const ny = dx / len;
          
          // Taper: slightly thinner at ends
          const taper = 1.0 - Math.abs((i / (points.length - 1)) - 0.5) * 0.3;
          const w = baseW * taper;
          
          // Apply per-bolt opacity for dynamic appear/disappear
          const alpha = (isMain ? 0.92 : 0.78) * boltOpacity;
          
          segments.push(
            p1.x - nx * w, p1.y - ny * w, alpha,
            p1.x + nx * w, p1.y + ny * w, alpha,
            p2.x - nx * w, p2.y - ny * w, alpha,
            p2.x + nx * w, p2.y + ny * w, alpha,
            p2.x - nx * w, p2.y - ny * w, alpha,
            p1.x + nx * w, p1.y + ny * w, alpha
          );
        }
      };
      
      // Generate and collect all bolt paths
      state.bolts.forEach(bolt => {
        // Skip bolts with very low opacity
        if (bolt.opacity < 0.05) return;
        
        const effectiveThickness = bolt.thickness * finalIntensity;
        if (effectiveThickness < 0.1) return;
        
        const points = generateAnimatedPath(bolt, state.time, centerX, centerY);
        
        // Sub-branches (inherit bolt opacity)
        bolt.branches.forEach(branch => {
          if (branch.subBranches) {
            branch.subBranches.forEach(sub => {
              const branchStartIdx = Math.floor(branch.startT * (points.length - 1));
              const branchStart = points[branchStartIdx];
              const branchPath = generateBranchPath(branchStart, branch, state.time, bolt.noise);
              const subStartIdx = Math.floor(sub.startT * (branchPath.length - 1));
              const subStart = branchPath[subStartIdx];
              const subBranch = { angle: branch.angle + sub.angleOffset, length: sub.length, speed: 4, seed: sub.seed };
              const subPath = generateBranchPath(subStart, subBranch, state.time, bolt.noise);
              addBoltPath(subPath, sub.thickness * finalIntensity, false, bolt.opacity * 0.7);
            });
          }
        });
        
        // Branches (inherit bolt opacity)
        bolt.branches.forEach(branch => {
          const startIdx = Math.floor(branch.startT * (points.length - 1));
          const startPoint = points[startIdx];
          const branchPoints = generateBranchPath(startPoint, branch, state.time, bolt.noise);
          addBoltPath(branchPoints, branch.thickness * finalIntensity, false, bolt.opacity * 0.85);
        });
        
        // Main bolt
        addBoltPath(points, effectiveThickness, true, bolt.opacity);
      });
      
      // Flash arcs (always visible, independent of bolt opacity)
      flashArcsRef.current.forEach(arc => {
        const age = now - arc.birth;
        const lifeRatio = age / arc.lifespan;
        const flashIntensity = lifeRatio < 0.25 ? lifeRatio / 0.25 : 1 - ((lifeRatio - 0.25) / 0.75);
        if (flashIntensity > 0.15) {
          const points = generateFlashPath(arc, state.time, centerX, centerY);
          addBoltPath(points, arc.thickness * flashIntensity * widthMultiplier, true, 1.0);
        }
      });
      
      if (segments.length > 0) {
        const data = new Float32Array(segments);
        gl.bindBuffer(gl.ARRAY_BUFFER, boltBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        
        gl.enableVertexAttribArray(posLoc);
        gl.enableVertexAttribArray(alphaLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 12, 0);
        gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 12, 8);
        
        // Draw with warm golden-amber color gradient (#ffb836 → #ff9100)
        gl.uniform3f(coreColorLoc, cfg.coreColor[0], cfg.coreColor[1], cfg.coreColor[2]);
        gl.uniform3f(midColorLoc, cfg.midColor[0], cfg.midColor[1], cfg.midColor[2]);
        gl.uniform3f(outerColorLoc, cfg.outerColor[0], cfg.outerColor[1], cfg.outerColor[2]);
        gl.uniform1f(intensityLoc, finalIntensity);
        gl.drawArrays(gl.TRIANGLES, 0, segments.length / 3);
      }
      
      // === PASS 2: Render volumetric plasma layer ===
      gl.bindFramebuffer(gl.FRAMEBUFFER, plasmaFB.framebuffer);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      gl.useProgram(plasmaProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      
      const plasmaPosLoc = gl.getAttribLocation(plasmaProgram, 'a_position');
      const plasmaTexLoc = gl.getAttribLocation(plasmaProgram, 'a_texCoord');
      gl.enableVertexAttribArray(plasmaPosLoc);
      gl.enableVertexAttribArray(plasmaTexLoc);
      gl.vertexAttribPointer(plasmaPosLoc, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(plasmaTexLoc, 2, gl.FLOAT, false, 16, 8);
      
      gl.uniform1f(gl.getUniformLocation(plasmaProgram, 'u_time'), state.time);
      gl.uniform2f(gl.getUniformLocation(plasmaProgram, 'u_center'), 0.5, 0.5);
      gl.uniform1f(gl.getUniformLocation(plasmaProgram, 'u_intensity'), finalIntensity);
      gl.uniform1f(gl.getUniformLocation(plasmaProgram, 'u_density'), cfg.plasmaDensity);
      gl.uniform1f(gl.getUniformLocation(plasmaProgram, 'u_centerBright'), cfg.plasmaCenterBrightness * centerPulse);
      gl.uniform1f(gl.getUniformLocation(plasmaProgram, 'u_noiseScale'), cfg.plasmaNoiseScale);
      gl.uniform3f(gl.getUniformLocation(plasmaProgram, 'u_innerColor'), cfg.plasmaInner[0], cfg.plasmaInner[1], cfg.plasmaInner[2]);
      gl.uniform3f(gl.getUniformLocation(plasmaProgram, 'u_outerColor'), cfg.plasmaOuter[0], cfg.plasmaOuter[1], cfg.plasmaOuter[2]);
      gl.uniform1f(gl.getUniformLocation(plasmaProgram, 'u_portalRadius'), cfg.portalRadius);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // === Helper function for blur pass ===
      const runBlurPass = (sourceTex, destFB, direction, radius) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destFB.framebuffer);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.ONE, gl.ONE);
        
        gl.useProgram(blurProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        
        const blurPosLoc = gl.getAttribLocation(blurProgram, 'a_position');
        const blurTexLoc = gl.getAttribLocation(blurProgram, 'a_texCoord');
        gl.enableVertexAttribArray(blurPosLoc);
        gl.enableVertexAttribArray(blurTexLoc);
        gl.vertexAttribPointer(blurPosLoc, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(blurTexLoc, 2, gl.FLOAT, false, 16, 8);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sourceTex);
        gl.uniform1i(gl.getUniformLocation(blurProgram, 'u_texture'), 0);
        gl.uniform2f(gl.getUniformLocation(blurProgram, 'u_resolution'), resolution, resolution);
        gl.uniform2f(gl.getUniformLocation(blurProgram, 'u_direction'), direction[0], direction[1]);
        gl.uniform1f(gl.getUniformLocation(blurProgram, 'u_radius'), radius);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      
      // === PASS 3: Multi-scale bloom ===
      // Tight bloom (sharp inner glow)
      runBlurPass(boltsFB.texture, blurFB1, [1.0, 0.0], cfg.bloomTightRadius);
      runBlurPass(blurFB1.texture, bloomTightFB, [0.0, 1.0], cfg.bloomTightRadius);
      
      // Medium bloom
      runBlurPass(boltsFB.texture, blurFB1, [1.0, 0.0], cfg.bloomMedRadius);
      runBlurPass(blurFB1.texture, bloomMedFB, [0.0, 1.0], cfg.bloomMedRadius);
      
      // Wide bloom (atmospheric halo)
      runBlurPass(boltsFB.texture, blurFB1, [1.0, 0.0], cfg.bloomWideRadius);
      runBlurPass(blurFB1.texture, bloomWideFB, [0.0, 1.0], cfg.bloomWideRadius);
      
      // === PASS 4: Composite all layers to screen ===
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, resolution, resolution);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      gl.useProgram(compositeProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      
      const compPosLoc = gl.getAttribLocation(compositeProgram, 'a_position');
      const compTexLoc = gl.getAttribLocation(compositeProgram, 'a_texCoord');
      gl.enableVertexAttribArray(compPosLoc);
      gl.enableVertexAttribArray(compTexLoc);
      gl.vertexAttribPointer(compPosLoc, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(compTexLoc, 2, gl.FLOAT, false, 16, 8);
      
      // Bind all textures
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, boltsFB.texture);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, 'u_bolts'), 0);
      
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, plasmaFB.texture);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, 'u_plasma'), 1);
      
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, bloomTightFB.texture);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, 'u_bloomTight'), 2);
      
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, bloomMedFB.texture);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, 'u_bloomMed'), 3);
      
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, bloomWideFB.texture);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, 'u_bloomWide'), 4);
      
      // Set uniforms
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_intensity'), finalIntensity);
      gl.uniform2f(gl.getUniformLocation(compositeProgram, 'u_center'), 0.5, 0.5);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_portalRadius'), cfg.portalRadius);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_bloomTightWeight'), cfg.bloomTightWeight);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_bloomMedWeight'), cfg.bloomMedWeight);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_bloomWideWeight'), cfg.bloomWideWeight);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_exposure'), cfg.toneMapExposure);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_centerGlow'), cfg.centerGlowStrength);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_centerPulse'), centerPulse);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_rimBloomBoost'), cfg.rimBloomBoost);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_glassOpacity'), cfg.glassOpacity);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_glassReflection'), cfg.glassReflectionStrength);
      // Golden-amber ambient color matching #ffb836 → #ff9100
      gl.uniform3f(gl.getUniformLocation(compositeProgram, 'u_ambientColor'), 1.0, 0.6, 0.1);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      electricAnimFrameRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      if (electricAnimFrameRef.current) {
        cancelAnimationFrame(electricAnimFrameRef.current);
      }
      gl.deleteProgram(boltProgram);
      gl.deleteProgram(blurProgram);
      gl.deleteProgram(plasmaProgram);
      gl.deleteProgram(compositeProgram);
      gl.deleteFramebuffer(plasmaFB.framebuffer);
      gl.deleteFramebuffer(boltsFB.framebuffer);
      gl.deleteFramebuffer(blurFB1.framebuffer);
      gl.deleteFramebuffer(blurFB2.framebuffer);
      gl.deleteFramebuffer(bloomTightFB.framebuffer);
      gl.deleteFramebuffer(bloomMedFB.framebuffer);
      gl.deleteFramebuffer(bloomWideFB.framebuffer);
      gl.deleteTexture(plasmaFB.texture);
      gl.deleteTexture(boltsFB.texture);
      gl.deleteTexture(blurFB1.texture);
      gl.deleteTexture(blurFB2.texture);
      gl.deleteTexture(bloomTightFB.texture);
      gl.deleteTexture(bloomMedFB.texture);
      gl.deleteTexture(bloomWideFB.texture);
      gl.deleteBuffer(quadBuffer);
      gl.deleteBuffer(boltBuffer);
      state.initialized = false;
      state.startTime = null;
      flashArcsRef.current = [];
    };
  }, [showElectricity]);

  const loadNewTopics = () => {
    // Trigger electricity effect - bolts initialize immediately in useEffect
    setShowElectricity(true);
    
    // Delay the actual topic swap so electricity effect can play
    setTimeout(() => {
      const currentOnWheel = new Set(prompts.slice(0, 20));
      const availablePrompts = ALL_PROMPTS.filter(p => !currentOnWheel.has(p) && !usedPromptsRef.current.has(p));
      
      let newPrompts;
      if (availablePrompts.length >= 20) {
        // Shuffle available and take 20
        const shuffled = [...availablePrompts].sort(() => Math.random() - 0.5);
        newPrompts = shuffled.slice(0, 20);
      } else if (availablePrompts.length > 0) {
        // Use all available + fill from unused in current set
        const shuffledAvailable = [...availablePrompts].sort(() => Math.random() - 0.5);
        const needed = 20 - shuffledAvailable.length;
        // Reset used tracking and pull from full list
        usedPromptsRef.current = new Set();
        const remaining = ALL_PROMPTS.filter(p => !new Set(shuffledAvailable).has(p));
        const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
        newPrompts = [...shuffledAvailable, ...shuffledRemaining.slice(0, needed)];
      } else {
        // All prompts used - reset and shuffle fresh
        usedPromptsRef.current = new Set();
        const shuffled = [...ALL_PROMPTS].sort(() => Math.random() - 0.5);
        newPrompts = shuffled.slice(0, 20);
      }
      
      // Track these as used
      newPrompts.forEach(p => usedPromptsRef.current.add(p));
      
      // Put remaining prompts after the first 20 for future loading
      const rest = ALL_PROMPTS.filter(p => !new Set(newPrompts).has(p)).sort(() => Math.random() - 0.5);
      setPrompts([...newPrompts, ...rest]);
      
      // Clear selection when loading new topics
      setSelectedPrompt(null);
      setAnimPhase(null);
      setShowReassembledPanel(false);
      setParticles([]);
      
      // Reset tracking for new set
      recentLandingsRef.current = [];
    }, 1000); // Swap happens at 1000ms into the effect
    
    // End electricity effect after full animation
    setTimeout(() => {
      setShowElectricity(false);
    }, 2200);
  };
  
  useEffect(() => { promptsRef.current = prompts.slice(0, 20); }, [prompts]);
  
  // Cylinder radius scaling with strict gap prevention
  useEffect(() => {
    const updateRadius = () => {
      if (wheelContainerRef.current) {
        const wheelSize = wheelContainerRef.current.offsetWidth;
        // The viewport is now 66% of container width with tighter clipping
        // Using 0.32 multiplier to ensure wheel fits within tilted viewport
        const calculatedRadius = wheelSize * 0.32;
        // Min 130 for small phones, max 320 for large screens
        const boundedRadius = Math.min(Math.max(calculatedRadius, 130), 320);
        setCylinderRadius(boundedRadius);
        
        // Panel height must scale with radius to prevent gaps
        // With 20 prompts at 18° spacing, panels need height ≈ radius * 0.32
        // Using 0.34 to ensure slight overlap for seamless appearance
        const calculatedPanelHeight = boundedRadius * 0.34;
        // Min 36px for readability, max 110px for large screens
        const boundedPanelHeight = Math.min(Math.max(calculatedPanelHeight, 36), 110);
        setPanelHeight(boundedPanelHeight);
        
        // Font size scales with panel height for readability
        // Target: ~42% of panel height, clamped for readability
        const calculatedFontSize = boundedPanelHeight * 0.42;
        // Min 14px for legibility, max 28px for large screens
        const boundedFontSize = Math.min(Math.max(calculatedFontSize, 14), 28);
        setFontSize(boundedFontSize);
        
        // Wheel tilt for 3D depth effect (water wheel appearance)
        // More tilt = more visible curve of the cylinder
        const calculatedTilt = wheelSize < 400 ? 14 : wheelSize < 600 ? 17 : 20;
        setWheelTilt(calculatedTilt);
      }
    };
    
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);
  
  // State for disintegration particles
  const [particles, setParticles] = useState([]);
  const [showReassembledPanel, setShowReassembledPanel] = useState(false);
  const [reassembleSparkles, setReassembleSparkles] = useState([]);
  
  // Generate particles for disintegration effect
  const generateParticles = () => {
    const newParticles = [];
    const numParticles = 60;
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      const size = 3 + Math.random() * 8;
      const delay = Math.random() * 1.5;
      newParticles.push({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 60,
        px: Math.cos(angle) * distance,
        py: Math.sin(angle) * distance - 50,
        size,
        delay,
        duration: 1.5 + Math.random() * 1.5
      });
    }
    return newParticles;
  };
  
  // Generate sparkles for reassembly effect
  const generateSparkles = () => {
    const sparkles = [];
    for (let i = 0; i < 30; i++) {
      sparkles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.5,
        size: 2 + Math.random() * 4
      });
    }
    return sparkles;
  };
  
  useEffect(() => {
    if (animPhase === 'warp') {
      // Warp phase - 600ms
      const timer = setTimeout(() => setAnimPhase('hold'), 600);
      return () => clearTimeout(timer);
    } else if (animPhase === 'hold') {
      // Hold for 3 seconds
      const timer = setTimeout(() => {
        setParticles(generateParticles());
        setAnimPhase('disintegrate');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (animPhase === 'disintegrate') {
      // Disintegrate for 3 seconds, then start reassembly
      const timer = setTimeout(() => {
        setReassembleSparkles(generateSparkles());
        setShowReassembledPanel(true);
        setAnimPhase('reassemble');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (animPhase === 'reassemble') {
      // Reassembly takes 1.5 seconds, then done
      const timer = setTimeout(() => {
        setAnimPhase('complete');
        setParticles([]);
        setReassembleSparkles([]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [animPhase]);
  
  // Removed auto-shuffle - user controls topic changes via NEW TOPICS button
  // This prevents prompt mismatch between wheel and animation
  
  const frameCountRef = useRef(0);
  const targetPromptRef = useRef(null);
  const easingPhaseRef = useRef(false);
  const lastKnownDirectionRef = useRef(1);
  
  const animate = () => {
    const now = Date.now();
    frameCountRef.current++;
    
    // Mark as coasting after 150ms of no input
    if (!isCoastingRef.current && now - lastInputTimeRef.current > 150 && Math.abs(velocityRef.current) > 2) {
      isCoastingRef.current = true;
    }
    
    const absVel = Math.abs(velocityRef.current);
    
    // PHASE 1: High velocity spinning - apply friction, throttle updates
    if (absVel >= 1.5 && !easingPhaseRef.current) {
      // Track direction while we have clear velocity
      if (absVel > 0.5) {
        lastKnownDirectionRef.current = velocityRef.current >= 0 ? 1 : -1;
      }
      
      // TEST MODE: Very high friction for immediate stop when released
      // NORMAL MODE: Variable friction set at spin start
      velocityRef.current *= TEST_MODE ? 0.5 : spinFrictionRef.current;
      rotationRef.current += velocityRef.current;
      
      // Throttle DOM updates at higher speeds
      let shouldUpdate = true;
      if (absVel >= 8) {
        shouldUpdate = frameCountRef.current % 3 === 0;
      } else if (absVel >= 3) {
        shouldUpdate = frameCountRef.current % 2 === 0;
      }
      
      if (shouldUpdate && wheelRotationRef.current) {
        wheelRotationRef.current.style.setProperty('--wheel-rotation', `${rotationRef.current}deg`);
      }
      
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // PHASE 2: Entering easing phase - calculate target prompt once
    // TEST MODE: Skip easing, just stop where released
    if (TEST_MODE) {
      if (absVel < 1.5) {
        velocityRef.current = 0;
        animationRef.current = null;
        return;
      }
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    if (!easingPhaseRef.current) {
      easingPhaseRef.current = true;
      const promptInterval = 18;
      const spinDirection = lastKnownDirectionRef.current;
      
      console.log('=== ENTERING EASING ===');
      console.log('Velocity:', velocityRef.current);
      console.log('Direction:', spinDirection);
      console.log('Rotation:', rotationRef.current);
      
      // Calculate current position relative to prompt boundaries
      const currentPromptIndex = rotationRef.current / promptInterval;
      
      // Target the nearest prompt in spin direction - pure physics
      let targetIndex;
      if (spinDirection > 0) {
        targetIndex = Math.ceil(currentPromptIndex);
      } else {
        targetIndex = Math.floor(currentPromptIndex);
      }
      
      targetPromptRef.current = targetIndex * promptInterval;
      console.log('Target:', targetPromptRef.current);
    }
    
    // PHASE 3: Smooth easing toward target prompt
    const target = targetPromptRef.current;
    const diff = target - rotationRef.current;
    
    // Smoothly ease toward target
    const easeSpeed = 0.08;
    const movement = diff * easeSpeed;
    
    rotationRef.current += movement;
    
    if (wheelRotationRef.current) {
      wheelRotationRef.current.style.setProperty('--wheel-rotation', `${rotationRef.current}deg`);
    }
    
    // PHASE 4: Stop when we're very close to target
    if (Math.abs(diff) < 0.1) {
      rotationRef.current = target;
      if (wheelRotationRef.current) {
        wheelRotationRef.current.style.setProperty('--wheel-rotation', `${target}deg`);
      }
      
      velocityRef.current = 0;
      isCoastingRef.current = false;
      easingPhaseRef.current = false;
      targetPromptRef.current = null;
      animationRef.current = null;
      
      const timeSinceLastInput = now - lastInputTimeRef.current;
      if (timeSinceLastInput > 200) {
        const currentTilt = wheelContainerRef.current ? 
          (wheelContainerRef.current.offsetWidth < 400 ? 14 : 
           wheelContainerRef.current.offsetWidth < 600 ? 17 : 20) : 15;
        
        let adjustedRotation = target + currentTilt;
        let normalizedRotation = adjustedRotation % 360;
        if (normalizedRotation < 0) normalizedRotation += 360;
        
        let selectedIndex = Math.round(normalizedRotation / 18) % 20;
        if (selectedIndex >= 20) selectedIndex = 0;
        if (selectedIndex < 0) selectedIndex = 19;
        
        // Track this landing in recent history (keep last 10)
        recentLandingsRef.current = [selectedIndex, ...recentLandingsRef.current].slice(0, 10);
        
        const selected = promptsRef.current[selectedIndex];
        
        console.log('=== WHEEL STOPPED ===');
        console.log('Final rotation:', target);
        console.log('Selected index:', selectedIndex, '→ Prompt:', selected);
        console.log('Recent landings:', recentLandingsRef.current);
        
        setSelectedPrompt(selected);
        setShowReassembledPanel(false);
        setParticles([]);
        
        // Only trigger animation if not disabled
        if (!DISABLE_PANEL_ANIMATION) {
          setAnimPhase('warp');
        }
      }
      return;
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  const startSpin = (delta) => {
    // Clear any existing animation state when starting a new manual spin
    if (selectedPrompt || animPhase) {
      setSelectedPrompt(null);
      setAnimPhase(null);
      setShowReassembledPanel(false);
      setParticles([]);
    }
    
    // Reset easing phase if re-spinning
    easingPhaseRef.current = false;
    targetPromptRef.current = null;
    
    // When starting a new spin from rest, add hidden offset for randomness
    if (Math.abs(velocityRef.current) < 2) {
      const randomPromptOffset = Math.floor(Math.random() * 20) * 18;
      const partialOffset = Math.random() * 17;
      const hiddenOffset = randomPromptOffset + partialOffset;
      
      rotationRef.current += hiddenOffset;
      
      if (wheelRotationRef.current) {
        wheelRotationRef.current.style.transition = 'none';
        wheelRotationRef.current.style.setProperty('--wheel-rotation', `${rotationRef.current}deg`);
        wheelRotationRef.current.offsetHeight;
      }
      
      spinFrictionRef.current = 0.982 + Math.random() * 0.006;
    }
    
    // Use momentum-based velocity that favors the current gesture direction
    const currentVel = velocityRef.current;
    const inputVel = delta * 0.5;
    
    // If input is in same direction as current velocity, add momentum
    if (Math.sign(inputVel) === Math.sign(currentVel) || Math.abs(currentVel) < 1) {
      velocityRef.current = currentVel * 0.85 + inputVel;
    } else {
      velocityRef.current = currentVel * 0.7 + inputVel * 0.6;
    }
    
    // Cap maximum velocity
    const maxVelocity = 100;
    if (velocityRef.current > maxVelocity) velocityRef.current = maxVelocity;
    if (velocityRef.current < -maxVelocity) velocityRef.current = -maxVelocity;
    
    // Set direction based on resulting velocity
    lastKnownDirectionRef.current = velocityRef.current >= 0 ? 1 : -1;
    
    lastInputTimeRef.current = Date.now();
    isCoastingRef.current = false;
    
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  const buttonSpin = () => {
    if (isCoastingRef.current) return;
    if (selectedPrompt || animPhase) {
      setSelectedPrompt(null);
      setAnimPhase(null);
      setShowReassembledPanel(false);
      setParticles([]);
    }
    
    // Reset easing phase
    easingPhaseRef.current = false;
    targetPromptRef.current = null;
    
    // CRITICAL: Random offset aligned to prompt boundaries (0-19 prompts = 0-342°)
    // This guarantees we start from a different prompt position each time
    const randomPromptOffset = Math.floor(Math.random() * 20) * 18;
    // Plus a small partial offset within the prompt (0-17°) for extra variance
    const partialOffset = Math.random() * 17;
    const hiddenOffset = randomPromptOffset + partialOffset;
    
    rotationRef.current += hiddenOffset;
    
    // Apply instantly - no transition, no visual change
    if (wheelRotationRef.current) {
      wheelRotationRef.current.style.transition = 'none';
      wheelRotationRef.current.style.setProperty('--wheel-rotation', `${rotationRef.current}deg`);
      wheelRotationRef.current.offsetHeight;
    }
    
    // Vary friction slightly for different travel distances
    spinFrictionRef.current = 0.982 + Math.random() * 0.006;
    
    // Wide velocity range for varied travel distance
    const baseVelocity = 40 + Math.random() * 35;
    
    // NEGATIVE velocity for forward/downward spin
    velocityRef.current = -baseVelocity;
    lastKnownDirectionRef.current = -1;
    lastInputTimeRef.current = Date.now();
    isCoastingRef.current = false;
    
    console.log('=== SPIN START === Prompt offset:', randomPromptOffset, 'Partial:', partialOffset.toFixed(1), 'Velocity:', velocityRef.current.toFixed(1), 'Friction:', spinFrictionRef.current.toFixed(4));
    
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  const handleRecordClick = () => {
    if (selectedPrompt) {
      setSelectedPromptForRecording(selectedPrompt);
      setView('record');
    }
  };
  
  const handleDisabledRecordClick = () => {
    setShowRecordTooltip(true);
    setTimeout(() => setShowRecordTooltip(false), 3000);
  };
  
  // No global event listeners needed - wheel container handles its own events
  
  if (view === 'wheel') {
    return (
      <div className="wheel-view-wrapper">
        <div className="wheel-content">
        
        {/* Persistent Steam Effects - React managed */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
          {steamWisps.map(wisp => (
            <div
              key={wisp.id}
              style={{
                position: 'absolute',
                left: wisp.left || 'auto',
                right: wisp.right || 'auto',
                top: wisp.top || 'auto',
                bottom: wisp.bottom || 'auto',
                marginLeft: wisp.offsetX + 'px',
                marginTop: wisp.offsetY + 'px',
                width: wisp.size * 1.2 + 'px',
                height: wisp.size + 'px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse at center, rgba(155,148,140,0.6) 0%, rgba(140,133,125,0.35) 40%, transparent 75%)',
                filter: 'blur(8px)',
                animation: `${wisp.animation} ${wisp.duration}ms ease-out forwards`
              }}
            />
          ))}
        </div>
        
        <div ref={wheelContainerRef} className="wheel-container"
          onMouseEnter={() => { isHoveringRef.current = true; }}
          onMouseLeave={() => { isHoveringRef.current = false; }}
          onMouseDown={(e)=>{
            e.preventDefault();
            e.stopPropagation();
            let lastY = e.clientY;
            let lastTime = Date.now();
            
            const move = (me) => {
              me.preventDefault();
              me.stopPropagation();
              
              const currentY = me.clientY;
              const currentTime = Date.now();
              const deltaY = currentY - lastY;
              const deltaTime = currentTime - lastTime;
              
              // Only process if enough time has passed
              if (deltaTime > 5) {
                // Negate deltaY: drag down = forward spin (negative velocity)
                startSpin(-deltaY * 1.0);
                lastY = currentY;
                lastTime = currentTime;
              }
            };
            
            const up = () => {
              document.removeEventListener('mousemove', move);
              document.removeEventListener('mouseup', up);
            };
            
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
          }}
          onTouchStart={(e)=>{
            e.stopPropagation();
            let lastY = e.touches[0].clientY;
            let lastTime = Date.now();
            
            const move = (te) => {
              te.preventDefault();
              te.stopPropagation();
              
              const currentY = te.touches[0].clientY;
              const currentTime = Date.now();
              const deltaY = currentY - lastY;
              const deltaTime = currentTime - lastTime;
              
              // Only process if enough time has passed (avoid excessive accumulation)
              if (deltaTime > 5) {
                // Negate deltaY: swipe down = forward spin (negative velocity)
                startSpin(-deltaY * 1.2);
                lastY = currentY;
                lastTime = currentTime;
              }
            };
            
            const end = () => {
              document.removeEventListener('touchmove', move);
              document.removeEventListener('touchend', end);
            };
            
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('touchend', end);
          }}
          onWheel={(e)=>{
            // Check if mouse is within circular wheel area to prevent edge triggering
            const rect = e.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const distanceFromCenter = Math.sqrt(
              Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
            );
            // Only respond if within 80% of container radius (the visible wheel area)
            const maxRadius = (rect.width / 2) * 0.8;
            if (distanceFromCenter > maxRadius) return;
            
            // Prevent page scroll when over the wheel
            e.preventDefault();
            e.stopPropagation();
            
            // Trackpad scrolling - swipe toward self (positive deltaY) = forward spin (negative velocity)
            startSpin(e.deltaY * 0.6);
          }}>
          
          {/* Warp speed motion lines */}
          {selectedPrompt && animPhase === 'warp' && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 39,
              pointerEvents: 'none',
              width: '300px',
              height: '200px'
            }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '3px',
                  height: '40px',
                  background: `linear-gradient(to bottom, transparent, rgba(255,215,0,${0.3 + Math.random() * 0.5}), rgba(255,140,0,0.8), transparent)`,
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-60px)`,
                  animation: `warpStreak 0.6s ease-out forwards`,
                  animationDelay: `${i * 0.03}s`
                }} />
              ))}
            </div>
          )}
          
          {/* Main animated panel - warp, hold, and disintegrate phases */}
          {selectedPrompt && animPhase && ['warp', 'hold', 'disintegrate'].includes(animPhase) && (
            <div style={{
              position:'absolute',
              left:'50%',
              top:'50%',
              transform: 'translate(-50%, -50%)',
              zIndex:40,
              perspective:'1000px',
              pointerEvents:'none'
            }}>
              <div className="prompt-text" style={{
                width:'250px',
                height:`${panelHeight}px`,
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                boxSizing:'border-box',
                background:'url("wood-panel.webp") center/cover no-repeat',
                backgroundColor:'#3a2818',
                border:'none',
                fontWeight:'normal',
                fontFamily:"'Carnivalee Freakshow', serif",
                fontSize:`${fontSize}px`,
                textAlign:'center',
                padding:'0 12px',
                lineHeight:'1',
                margin:0,
                boxShadow: animPhase === 'disintegrate' 
                  ? '0 0 50px rgba(255,215,0,0.9), 0 0 100px rgba(255,140,0,0.6)'
                  : '0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,140,0,0.4)',
                transformStyle:'preserve-3d',
                animation: animPhase === 'warp' 
                  ? 'warpSpeed 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
                  : animPhase === 'disintegrate'
                    ? 'disintegrateGlow 3s ease-out forwards'
                    : 'none',
                transform: (animPhase === 'hold' || animPhase === 'disintegrate') ? 'scale(2.25)' : undefined
              }}><span className="carved-text">{selectedPrompt}</span></div>
              
              {/* Disintegration particles - scaled up to match panel */}
              {animPhase === 'disintegrate' && particles.map(p => (
                <div key={p.id} style={{
                  position: 'absolute',
                  left: `calc(50% + ${p.x * 2.25}px)`,
                  top: `calc(50% + ${p.y * 2.25}px)`,
                  width: `${p.size * 1.5}px`,
                  height: `${p.size * 1.5}px`,
                  background: `radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,140,0,0.8) 50%, transparent 100%)`,
                  borderRadius: '50%',
                  '--px': `${p.px * 1.5}px`,
                  '--py': `${p.py * 1.5}px`,
                  animation: `particleFly ${p.duration}s ease-out forwards`,
                  animationDelay: `${p.delay}s`,
                  pointerEvents: 'none'
                }} />
              ))}
            </div>
          )}
          
          <div style={{position:'absolute',left:'20px',right:'20px',top:'0px',bottom:'0px',backgroundImage:'url("portal-ring.webp")',backgroundSize:'contain',backgroundPosition:'center',backgroundRepeat:'no-repeat',zIndex:30,pointerEvents:'none',filter:'drop-shadow(0 6px 4px rgba(0,0,0,0.5)) drop-shadow(0 12px 10px rgba(0,0,0,0.4)) drop-shadow(0 24px 20px rgba(0,0,0,0.3)) drop-shadow(0 40px 35px rgba(0,0,0,0.2)) drop-shadow(0 60px 50px rgba(0,0,0,0.15))'}}/>
          
          {/* Electricity Effect - Canvas-based for true additive blending */}
          {showElectricity && (
            <canvas
              ref={electricCanvasRef}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'calc(min(100%, 100vh - 40px) * 0.78)',
                height: 'calc(min(100%, 100vh - 40px) * 0.78)',
                borderRadius: '50%',
                zIndex: 28,
                pointerEvents: 'none'
              }}
              width={400}
              height={400}
            />
          )}
          
          {/* Inner shadow at bottom of portal ring interior */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(min(100%, 100vh - 40px) * 0.68)',
            height: 'calc(min(100%, 100vh - 40px) * 0.68)',
            borderRadius: '50%',
            boxShadow: 'inset 0 -62px 50px -14px rgba(0,0,0,0.84), inset 0 -103px 72px -29px rgba(0,0,0,0.62), inset 0 -134px 91px -39px rgba(0,0,0,0.43)',
            zIndex: 29,
            pointerEvents: 'none'
          }}/>
          
          {/* Reassembled panel on the right side of portal */}
          {showReassembledPanel && selectedPrompt && (
            <div style={{
              position: 'absolute',
              left: 'calc(100% + 45px)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 25,
              pointerEvents: 'none'
            }}>
              {/* Transporter sparkles during reassembly */}
              {animPhase === 'reassemble' && reassembleSparkles.map(s => (
                <div key={s.id} style={{
                  position: 'absolute',
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.size * 2}px`,
                  height: `${s.size * 2}px`,
                  background: 'radial-gradient(circle, #fff 0%, rgba(100,200,255,0.8) 50%, transparent 100%)',
                  borderRadius: '50%',
                  animation: 'transporterSparkle 0.3s ease-in-out infinite',
                  animationDelay: `${s.delay}s`
                }} />
              ))}
              
              {/* Scan line during reassembly */}
              {animPhase === 'reassemble' && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: 'linear-gradient(90deg, transparent, rgba(100,200,255,0.9), transparent)',
                  animation: 'scanlineMove 0.75s ease-in-out infinite',
                  zIndex: 5
                }} />
              )}
              
              {/* The reassembled panel - landscape rectangle with larger text */}
              <div className="prompt-text" style={{
                width: '440px',
                height: '198px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                background: 'url("wood-panel.webp") center/cover no-repeat',
                backgroundColor: '#3a2818',
                border: 'none',
                fontWeight: 'normal',
                fontFamily: "'Carnivalee Freakshow', serif",
                fontSize: `${fontSize * 2.42}px`,
                textAlign: 'center',
                padding: '22px 31px',
                lineHeight: '1.1',
                margin: 0,
                borderRadius: '8px',
                boxShadow: animPhase === 'reassemble' 
                  ? '0 0 50px rgba(100,200,255,0.7), 0 0 100px rgba(100,200,255,0.4)'
                  : '0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,140,0,0.3)',
                animation: animPhase === 'reassemble' ? 'reassembleReveal 1.5s ease-out forwards' : 'none',
                opacity: animPhase === 'complete' ? 1 : undefined
              }}><span className="carved-text">{selectedPrompt}</span></div>
            </div>
          )}
          
          <div className="portal-inner-shadow" />
          
          <div className="wheel-inner-depth" />
          
          <div className="wheel-viewport">
            <div style={{transform:`rotateX(${wheelTilt}deg)`,transformStyle:'preserve-3d',width:'100%',height:'100%',position:'relative'}}>
              <div ref={wheelRotationRef} className="wheel-cylinder">
              {prompts.slice(0, 20).map((p,i)=>{
                const angle = i * 18;
                const radius = cylinderRadius;
                const radian = (angle * Math.PI) / 180;
                const y = Math.sin(radian) * radius;
                const z = Math.cos(radian) * radius;
                
                return <div key={i} className="wheel-panel" style={{height:`${panelHeight}px`,marginTop:`${-panelHeight/2}px`,transform:`translate3d(0, ${y}px, ${z}px) rotateX(${-angle}deg)`}}>
                  <div className="wheel-panel-inner" style={{fontSize:`${fontSize}px`}}><span className="carved-text">{p}</span></div>
                </div>;
              })}
              </div>
            </div>
          </div>
          
          <div className="wheel-depth-overlay" />
        </div>
        
        <div className="selected-prompt-container">
          {/* Selected prompt panel area - panel now appears on right side after animation */}
        </div>
        
        <div ref={buttonsContainerRef} className="buttons-container">
          {/* SPIN Image Button */}
          <div 
            className="spin-wheel-button"
            onClick={buttonSpin}
            onMouseDown={() => setSpinPressed(true)}
            onMouseUp={() => setSpinPressed(false)}
            onMouseLeave={() => setSpinPressed(false)}
            onTouchStart={() => setSpinPressed(true)}
            onTouchEnd={() => setSpinPressed(false)}
            style={{
              position: 'absolute',
              left: '-30px',
              top: '-170px',
              width: '90px',
              height: '90px',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6)) drop-shadow(0 8px 15px rgba(0,0,0,0.4))',
              borderRadius: '50%'
            }}
          >
            <img 
              src={spinPressed ? 'story-portal-button-spin-click.webp' : 'story-portal-button-spin-static.webp'}
              alt="Spin"
              draggable="false"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                borderRadius: '50%'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <span className={`engraved-material-icon${spinPressed ? ' pressed' : ''}`} style={{
                fontSize: '38px',
                fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
                transform: 'scaleX(-1)'
              }}>flip_camera_android</span>
            </div>
          </div>
          
          {/* NEW TOPICS Image Button */}
          <div 
            className="image-button new-topics-btn"
            onClick={loadNewTopics}
            onMouseDown={() => setNewTopicsPressed(true)}
            onMouseUp={() => setNewTopicsPressed(false)}
            onMouseLeave={() => setNewTopicsPressed(false)}
            onTouchStart={() => setNewTopicsPressed(true)}
            onTouchEnd={() => setNewTopicsPressed(false)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <img 
              src={newTopicsPressed ? 'story-portal-button-click.webp' : 'story-portal-button-primary.webp'}
              alt="New Topics"
              draggable="false"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
            <div className="button-content">
              <svg className={`engraved-icon${newTopicsPressed ? ' pressed' : ''}`} viewBox="0 0 24 24" style={{width: 'clamp(18px, 4vw, 32px)', height: 'clamp(18px, 4vw, 32px)'}}>
                <path d="M14 3H21V10L18.5 7.5L14.5 11.5L12.5 9.5L16.5 5.5L14 3ZM14 21H21V14L18.5 16.5L5.5 3.5L3.5 5.5L16.5 18.5L14 21ZM3.5 18.5L5.5 20.5L9.5 16.5L7.5 14.5L3.5 18.5Z"/>
              </svg>
              <span className={`engraved-button-text${newTopicsPressed ? ' pressed' : ''}`} style={{
                fontSize: 'clamp(12px, 2.8vw, 22px)'
              }}>New Topics</span>
            </div>
          </div>
          
          {/* RECORD Image Button */}
          <div 
            className="image-button record-btn"
            onClick={selectedPrompt ? handleRecordClick : handleDisabledRecordClick}
            onMouseDown={() => selectedPrompt && setRecordPressed(true)}
            onMouseUp={() => setRecordPressed(false)}
            onMouseLeave={() => setRecordPressed(false)}
            onTouchStart={() => selectedPrompt && setRecordPressed(true)}
            onTouchEnd={() => setRecordPressed(false)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {showRecordTooltip && !selectedPrompt && (
              <div className="record-tooltip">
                Spin the wheel to receive your story prompt to record!
              </div>
            )}
            <img 
              src={(recordPressed && selectedPrompt) ? 'story-portal-button-click.webp' : 'story-portal-button-primary.webp'}
              alt="Record"
              draggable="false"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
            <div className="button-content">
              <span className={`engraved-material-icon${(selectedPrompt && recordPressed) ? ' pressed' : ''}`}>
                {selectedPrompt ? 'adaptive_audio_mic' : 'adaptive_audio_mic_off'}
              </span>
              <span className={`engraved-button-text${selectedPrompt ? (recordPressed ? ' pressed' : '') : ''}`} style={{
                fontSize: 'clamp(12px, 2.8vw, 22px)'
              }}>Record</span>
            </div>
          </div>
        </div>
        
        {/* Secondary Navigation Buttons - Right side, stacked vertically */}
        
        {/* Hamburger Menu Button - Above and left-aligned with How to Play */}
        <div 
          className="nav-buttons hamburger-menu-button"
          onClick={() => {
            // Don't allow clicks during animation
            if (hamburgerAnimatingRef.current) return;
            hamburgerAnimatingRef.current = true;
            
            if (!menuOpen) {
              // === OPENING ANIMATION SEQUENCE ===
              // First, render the panels (if not already rendered)
              if (!menuHasBeenOpened) {
                setMenuHasBeenOpened(true);
                // Wait for React to render panels in closed state, then open
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    setMenuOpen(true);
                  });
                });
              } else {
                setMenuOpen(true);
              }
              
              // Trigger smoke poof effect immediately when opening
              // Clear any existing smoke timeouts
              if (smokeTimeoutRef.current) {
                clearTimeout(smokeTimeoutRef.current);
              }
              if (smokeDelayTimeoutRef.current) {
                clearTimeout(smokeDelayTimeoutRef.current);
              }
              // Increment key to force fresh animation
              setSmokeAnimKey(prev => prev + 1);
              setShowSmokePoof(true);
              smokeTimeoutRef.current = setTimeout(() => {
                setShowSmokePoof(false);
              }, 3500);
              
              // 1. Extrude lines + start gear spin
              setHamburgerAnimPhase('opening-extrude');
              
              setTimeout(() => {
                // 2. Lines collapse to center (still horizontal at 360deg)
                setHamburgerAnimPhase('opening-collapse');
              }, 100);
              
              setTimeout(() => {
                // 3. Collapsed lines spin to form X shape
                setHamburgerAnimPhase('opening-spin-to-x');
              }, 350);
              
              setTimeout(() => {
                // 4. X is fully formed but still lifted (shows unified X path)
                // Trigger before spin animation ends to avoid two-line flash
                setHamburgerAnimPhase('opening-x-lifted');
              }, 650);
              
              setTimeout(() => {
                // 5. X engraves back in
                setHamburgerAnimPhase('opening-engrave');
              }, 800);
              
              // Fade in logo near end of menu opening animation
              // Clear any existing logo timeout
              if (logoTimeoutRef.current) {
                clearTimeout(logoTimeoutRef.current);
              }
              setTimeout(() => {
                setShowMenuLogo(true);
              }, 700);
              
              setTimeout(() => {
                // Animation complete
                setHamburgerAnimPhase(null);
                hamburgerAnimatingRef.current = false;
              }, 1100);
              
            } else {
              // === CLOSING ANIMATION SEQUENCE ===
              // Set menuOpen false immediately so items retract right away
              setMenuOpen(false);
              // Reset sway state
              setSwayingFromPanel(null);
              
              // Start logo fade out immediately when closing
              // Clear any existing logo timeout
              if (logoTimeoutRef.current) {
                clearTimeout(logoTimeoutRef.current);
              }
              // Start fading immediately - the 2s CSS transition will handle the slow fade
              setShowMenuLogo(false);
              
              // Trigger smoke poof effect AFTER all panels have landed back at wheel
              // Panel 4 is last to land: 0.36s delay + 0.7s animation = ~1.06s
              // Trigger just before it lands for seamless effect
              // Clear any existing smoke timeouts first
              if (smokeTimeoutRef.current) {
                clearTimeout(smokeTimeoutRef.current);
              }
              if (smokeDelayTimeoutRef.current) {
                clearTimeout(smokeDelayTimeoutRef.current);
              }
              smokeDelayTimeoutRef.current = setTimeout(() => {
                // Increment key to force fresh animation
                setSmokeAnimKey(prev => prev + 1);
                setShowSmokePoof(true);
                // Keep smoke visible longer for lingering effect
                smokeTimeoutRef.current = setTimeout(() => {
                  setShowSmokePoof(false);
                }, 3500);
              }, 900);
              
              // 1. Extrude X + start gear spin
              setHamburgerAnimPhase('closing-extrude');
              
              setTimeout(() => {
                // 2. X spins back to single horizontal line (still at center)
                setHamburgerAnimPhase('closing-spin-to-line');
              }, 100);
              
              setTimeout(() => {
                // 3. Lines expand from center to hamburger positions
                setHamburgerAnimPhase('closing-expand');
              }, 600);
              
              setTimeout(() => {
                // 4. Hamburger engraves back in
                setHamburgerAnimPhase('closing-engrave');
              }, 850);
              
              setTimeout(() => {
                // Animation complete
                setHamburgerAnimPhase(null);
                hamburgerAnimatingRef.current = false;
              }, 1150);
            }
          }}
          style={{
            position: 'absolute',
            right: 'calc(170px)',
            top: 'calc(34% - 195px)',
            cursor: hamburgerAnimatingRef.current ? 'default' : 'pointer',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            width: '80px',
            height: '80px',
            ...buttonShadowStyle,
            zIndex: 1000
          }}
        >
          {/* Gear background with rotation animation */}
          <img 
            src="story-portal-app-hamburger-menu-gear.webp"
            alt="Menu"
            draggable="false"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              animation: ['opening-extrude', 'opening-collapse', 'opening-spin-to-x', 'opening-x-lifted'].includes(hamburgerAnimPhase)
                ? 'gearSpinClockwise 0.75s ease-in-out forwards'
                : ['closing-extrude', 'closing-spin-to-line', 'closing-expand'].includes(hamburgerAnimPhase)
                  ? 'gearSpinCounterClockwise 0.75s ease-in-out forwards'
                  : 'none'
            }}
          />
          
          {/* Hamburger/X lines using SVG */}
          <svg 
            viewBox="0 0 80 80" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            <defs>
              {/* Warm gradient for engraved state */}
              <linearGradient id="hamburger-warm-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a3520"/>
                <stop offset="15%" stopColor="#6a4a28"/>
                <stop offset="30%" stopColor="#8a6535"/>
                <stop offset="50%" stopColor="#b8863c"/>
                <stop offset="70%" stopColor="#d4a045"/>
                <stop offset="85%" stopColor="#c89038"/>
                <stop offset="100%" stopColor="#a87030"/>
              </linearGradient>
              
              {/* Brighter gradient for extruded state */}
              <linearGradient id="hamburger-extruded-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9a7540"/>
                <stop offset="20%" stopColor="#c8964a"/>
                <stop offset="50%" stopColor="#e4b050"/>
                <stop offset="80%" stopColor="#f0c858"/>
                <stop offset="100%" stopColor="#d8a048"/>
              </linearGradient>
              
              {/* Engraved filter */}
              <filter id="hamburger-engraved-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="4" seed="12" result="noise"/>
                <feColorMatrix type="matrix" in="noise" result="metalNoise"
                  values="0.3 0 0 0 0
                          0.28 0 0 0 0
                          0.2 0 0 0 0
                          0 0 0 0.5 0"/>
                <feComposite in="metalNoise" in2="SourceGraphic" operator="in" result="clippedNoise"/>
                <feBlend in="SourceGraphic" in2="clippedNoise" mode="multiply" result="texturedShape"/>
                
                <feOffset dx="0" dy="1.3" in="SourceAlpha" result="shadowOffset"/>
                <feGaussianBlur stdDeviation="0.4" in="shadowOffset" result="shadowBlur"/>
                <feComposite in="shadowBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowCutout"/>
                <feFlood flood-color="rgba(10, 5, 0, 0.9)" result="shadowColor"/>
                <feComposite in="shadowColor" in2="shadowCutout" operator="in" result="innerShadow"/>
                
                <feOffset dx="0" dy="-1" in="SourceAlpha" result="highlightOffset"/>
                <feGaussianBlur stdDeviation="0.25" in="highlightOffset" result="highlightBlur"/>
                <feComposite in="highlightBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="highlightCutout"/>
                <feFlood flood-color="rgba(220, 200, 160, 0.7)" result="highlightColor"/>
                <feComposite in="highlightColor" in2="highlightCutout" operator="in" result="innerHighlight"/>
                
                <feMerge>
                  <feMergeNode in="texturedShape"/>
                  <feMergeNode in="innerShadow"/>
                  <feMergeNode in="innerHighlight"/>
                </feMerge>
              </filter>
              
              {/* Extruded filter - now just a clean look for floating lines */}
              <filter id="hamburger-extruded-filter" x="-50%" y="-50%" width="200%" height="200%">
                {/* Slight outer glow for floating appearance */}
                <feDropShadow dx="0" dy="0" stdDeviation="0.5" floodColor="rgba(255,220,150,0.3)"/>
              </filter>
              
              {/* Shadow filter for the shadow cast on the gear surface */}
              <filter id="hamburger-shadow-filter" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feFlood floodColor="rgba(0,0,0,0.6)" result="shadowColor"/>
                <feComposite in="shadowColor" in2="blur" operator="in"/>
              </filter>
            </defs>
            
            {/* Animated lines container - centered at 40,40 */}
            <g style={{ transform: 'translate(40px, 40px)' }}>
              {(() => {
                // Determine effect states (lifted/floating vs engraved)
                const isLifted = ['opening-extrude', 'opening-collapse', 'opening-spin-to-x', 'opening-x-lifted',
                                  'closing-extrude', 'closing-spin-to-line', 'closing-expand'].includes(hamburgerAnimPhase);
                
                // During spin phases, use no filter to avoid two-line shading look
                const isSpinning = hamburgerAnimPhase === 'opening-spin-to-x' || hamburgerAnimPhase === 'closing-spin-to-line';
                const currentFilter = isSpinning ? 'none' : (isLifted ? 'url(#hamburger-extruded-filter)' : 'url(#hamburger-engraved-filter)');
                const currentGradient = isLifted ? 'url(#hamburger-extruded-gradient)' : 'url(#hamburger-warm-gradient)';
                
                // Determine if we're in X shape (rotated 45deg) vs hamburger shape (horizontal)
                const isXRotation = (menuOpen && !hamburgerAnimPhase) || 
                                    hamburgerAnimPhase === 'opening-spin-to-x' || 
                                    hamburgerAnimPhase === 'opening-x-lifted' ||
                                    hamburgerAnimPhase === 'opening-engrave' ||
                                    hamburgerAnimPhase === 'closing-extrude';
                
                // Determine if lines are collapsed to center vs spread out
                const isCollapsed = hamburgerAnimPhase === 'opening-collapse' ||
                                    hamburgerAnimPhase === 'opening-spin-to-x' ||
                                    hamburgerAnimPhase === 'opening-x-lifted' ||
                                    hamburgerAnimPhase === 'opening-engrave' ||
                                    hamburgerAnimPhase === 'closing-extrude' ||
                                    hamburgerAnimPhase === 'closing-spin-to-line' ||
                                    (menuOpen && !hamburgerAnimPhase);
                
                // When to show unified X path (for proper shading as single element)
                // Show when X is fully formed and not animating
                const showXPath = (menuOpen && !hamburgerAnimPhase) ||  // Static X
                                  hamburgerAnimPhase === 'opening-x-lifted' ||  // X formed but still lifted
                                  hamburgerAnimPhase === 'opening-engrave' ||
                                  hamburgerAnimPhase === 'closing-extrude';
                
                // Transition duration based on phase
                let transitionDuration = '0.25s';
                if (isSpinning) {
                  transitionDuration = '0.35s';  // Spin animation
                } else if (hamburgerAnimPhase === 'opening-collapse' || hamburgerAnimPhase === 'closing-expand') {
                  transitionDuration = '0.22s';
                } else if (hamburgerAnimPhase === 'opening-x-lifted') {
                  transitionDuration = '0.15s';  // Quick transition for the path swap
                }
                
                // Line positions: collapsed at center (0) vs spread out (±11.5)
                const line1TranslateY = isCollapsed ? 0 : -11.5;
                const line3TranslateY = isCollapsed ? 0 : 11.5;
                
                // Rotations: X=45deg/-45deg, hamburger=360deg
                const line1Rotation = isXRotation ? 45 : 360;
                const line3Rotation = isXRotation ? -45 : 360;
                
                // Middle line opacity (hidden when collapsed/X)
                const line2Opacity = isCollapsed ? 0 : 1;
                
                // Line dimensions - NO corner radius per user request
                const lineHeight = 8;
                const lineWidth = 30;
                
                // Scale for "flying toward viewer" effect - lines get bigger when lifted
                const liftScale = isLifted ? 1.35 : 1;
                
                // Shadow offset increases as lines fly forward (further from surface = more offset)
                const shadowOffsetX = isLifted ? 3 : 0;
                const shadowOffsetY = isLifted ? 6 : 0;
                const shadowBlur = isLifted ? 4 : 0;
                
                return (
                  <>
                    {/* SHADOW LAYER - Cast on gear surface when lines are lifted */}
                    {/* Hide during spin phases to avoid two-line shadow appearance */}
                    <g style={{ 
                      opacity: (isLifted && !isSpinning) ? 0.5 : 0,
                      transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                      transform: `translate(${shadowOffsetX}px, ${shadowOffsetY}px)`
                    }}>
                      {showXPath ? (
                        // X shadow
                        <path
                          d="M -7.78,-13.44 L 0,-5.66 L 7.78,-13.44 L 13.44,-7.78 L 5.66,0 L 13.44,7.78 L 7.78,13.44 L 0,5.66 L -7.78,13.44 L -13.44,7.78 L -5.66,0 L -13.44,-7.78 Z"
                          fill="rgba(0,0,0,0.8)"
                          filter="url(#hamburger-shadow-filter)"
                        />
                      ) : (
                        // Hamburger/transitioning shadows
                        <>
                          <rect 
                            x={-lineWidth/2}
                            y={-lineHeight/2}
                            width={lineWidth}
                            height={lineHeight}
                            fill="rgba(0,0,0,0.8)"
                            filter="url(#hamburger-shadow-filter)"
                            style={{
                              transition: `transform ${transitionDuration} ease-in-out`,
                              transform: `translateY(${line1TranslateY}px) rotate(${line1Rotation}deg)`,
                              transformOrigin: 'center center',
                              transformBox: 'fill-box'
                            }}
                          />
                          <rect 
                            x={-lineWidth/2}
                            y={-lineHeight/2}
                            width={lineWidth}
                            height={lineHeight}
                            fill="rgba(0,0,0,0.8)"
                            filter="url(#hamburger-shadow-filter)"
                            style={{
                              transition: `opacity ${transitionDuration} ease-in-out`,
                              opacity: line2Opacity
                            }}
                          />
                          <rect 
                            x={-lineWidth/2}
                            y={-lineHeight/2}
                            width={lineWidth}
                            height={lineHeight}
                            fill="rgba(0,0,0,0.8)"
                            filter="url(#hamburger-shadow-filter)"
                            style={{
                              transition: `transform ${transitionDuration} ease-in-out`,
                              transform: `translateY(${line3TranslateY}px) rotate(${line3Rotation}deg)`,
                              transformOrigin: 'center center',
                              transformBox: 'fill-box'
                            }}
                          />
                        </>
                      )}
                    </g>
                    
                    {/* MAIN LINES - Container with scale for flying toward viewer effect */}
                    <g style={{
                      transform: `scale(${liftScale})`,
                      transition: 'transform 0.2s ease-out'
                    }}>
                      {/* Unified X path - visible during X states for proper unified shading */}
                      <path
                        d="M -7.78,-13.44 L 0,-5.66 L 7.78,-13.44 L 13.44,-7.78 L 5.66,0 L 13.44,7.78 L 7.78,13.44 L 0,5.66 L -7.78,13.44 L -13.44,7.78 L -5.66,0 L -13.44,-7.78 Z"
                        fill={currentGradient}
                        filter={currentFilter}
                        style={{
                          opacity: showXPath ? 1 : 0,
                          transition: 'opacity 0.05s ease-in-out'
                        }}
                      />
                      
                      {/* Rects - visible during hamburger states and animations */}
                      <g style={{ opacity: showXPath ? 0 : 1, transition: 'opacity 0.05s ease-in-out' }}>
                        {/* Line 1 - Top / becomes X diagonal */}
                        <rect 
                          x={-lineWidth/2}
                          y={-lineHeight/2}
                          width={lineWidth}
                          height={lineHeight}
                          fill={currentGradient}
                          filter={currentFilter}
                          style={{
                            transition: `transform ${transitionDuration} ease-in-out`,
                            transform: `translateY(${line1TranslateY}px) rotate(${line1Rotation}deg)`,
                            transformOrigin: 'center center',
                            transformBox: 'fill-box'
                          }}
                        />
                        
                        {/* Line 2 - Middle (fades out when collapsed) */}
                        <rect 
                          x={-lineWidth/2}
                          y={-lineHeight/2}
                          width={lineWidth}
                          height={lineHeight}
                          fill={currentGradient}
                          filter={currentFilter}
                          style={{
                            transition: `opacity ${transitionDuration} ease-in-out`,
                            opacity: line2Opacity
                          }}
                        />
                        
                        {/* Line 3 - Bottom / becomes X diagonal */}
                        <rect 
                          x={-lineWidth/2}
                          y={-lineHeight/2}
                          width={lineWidth}
                          height={lineHeight}
                          fill={currentGradient}
                          filter={currentFilter}
                          style={{
                            transition: `transform ${transitionDuration} ease-in-out`,
                            transform: `translateY(${line3TranslateY}px) rotate(${line3Rotation}deg)`,
                            transformOrigin: 'center center',
                            transformBox: 'fill-box'
                          }}
                        />
                      </g>
                    </g>
                  </>
                );
              })()}
            </g>
          </svg>
        </div>
        
        {/* GEAR MENU OVERLAY - Shoots out when hamburger menu is clicked */}
        {/* Backdrop blur overlay */}
        <div 
          className="menu-backdrop"
          onClick={() => {
            if (hamburgerAnimatingRef.current) return;
            // Clicking backdrop closes menu
            hamburgerAnimatingRef.current = true;
            
            // Set menuOpen false immediately so items retract right away
            setMenuOpen(false);
            
            setHamburgerAnimPhase('closing-extrude');
            
            setTimeout(() => {
              setHamburgerAnimPhase('closing-spin-to-line');
            }, 100);
            
            setTimeout(() => {
              setHamburgerAnimPhase('closing-expand');
            }, 600);
            
            setTimeout(() => {
              setHamburgerAnimPhase('closing-engrave');
            }, 850);
            
            setTimeout(() => {
              setHamburgerAnimPhase(null);
              hamburgerAnimatingRef.current = false;
            }, 1150);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: menuOpen ? 'blur(8px)' : 'blur(0px)',
            WebkitBackdropFilter: menuOpen ? 'blur(8px)' : 'blur(0px)',
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? 'auto' : 'none',
            transition: 'opacity 1s ease-out, backdrop-filter 1s ease-out, -webkit-backdrop-filter 1s ease-out',
            zIndex: 998
          }}
        />
        
        {/* Menu Panel Items - Fly from wheel center like prompt panels */}
        {/* Only render after menu has been opened once to avoid initial animation */}
        {menuHasBeenOpened && [
          { id: 1, label: 'Our Story', targetY: 'calc(38% - 165px)', hasTopRope: false, hasBottomRope: true },
          { id: 2, label: 'Our Work', targetY: 'calc(38% - 65px)', hasTopRope: true, hasBottomRope: true },
          { id: 3, label: 'Booking', targetY: 'calc(38% + 35px)', hasTopRope: true, hasBottomRope: true },
          { id: 4, label: 'Privacy & Terms', targetY: 'calc(38% + 135px)', hasTopRope: true, hasBottomRope: false }
        ].map((item, index) => {
          // Opening: reverse order (panel 4 first, panel 1 last)
          // Closing: normal order (panel 1 first, panel 4 last)
          const openDelay = (3 - index) * 0.12;  // 4->0.00s, 3->0.12s, 2->0.24s, 1->0.36s
          const closeDelay = index * 0.12;       // 1->0.00s, 2->0.12s, 3->0.24s, 4->0.36s
          const dealDelay = menuOpen ? openDelay : closeDelay;
          
          // Sway animation - calculate delay based on distance from clicked panel
          const isSwaying = swayingFromPanel !== null && menuOpen;
          const clickedIndex = swayingFromPanel ? swayingFromPanel - 1 : 0;
          const distanceFromClicked = Math.abs(index - clickedIndex);
          const swayDelay = distanceFromClicked * 0.12; // 120ms wave propagation delay
          const isClickedPanel = swayingFromPanel === item.id;
          
          // Rope styling - extra long to maintain solid connection during 3D animations
          // Use translateZ to push behind panel face in 3D space
          const ropeStyle = {
            position: 'absolute',
            width: '5px',
            height: '40px',
            background: 'linear-gradient(90deg, #1a1a1a 0%, #3a3a3a 30%, #4a4a4a 50%, #3a3a3a 70%, #1a1a1a 100%)',
            borderRadius: '2.5px',
            boxShadow: 'inset 0 0 3px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)',
            transform: 'translateZ(-5px)'
          };
          
          // Determine animation to apply
          let animationStyle = 'none';
          if (isSwaying) {
            if (isClickedPanel) {
              animationStyle = `menuPanelPush 2.5s ease-out forwards`;
            } else {
              animationStyle = `menuPanelSway 2.5s ease-out ${swayDelay}s forwards`;
            }
          }
          
          return (
            <div
              key={`${item.id}-${swayAnimKey}`}
              className="menu-panel-item"
              style={{
                position: 'fixed',
                // Always centered horizontally
                left: '50%',
                // Start at wheel center, end at target
                top: menuOpen ? item.targetY : '38%',
                // Flip animation using CSS transition (when not swaying)
                transform: menuOpen 
                  ? 'translate(-50%, -50%) perspective(1000px) rotateX(0deg)'
                  : 'translate(-50%, -50%) perspective(1000px) rotateX(-360deg)',
                transformOrigin: 'center center',
                transformStyle: 'preserve-3d',
                // Match wheel panel dimensions (250px x 80px)
                width: '250px',
                height: '80px',
                background: 'url("wood-panel.webp") center/cover no-repeat',
                backgroundColor: '#3a2818',
                borderRadius: '4px',
                boxShadow: menuOpen 
                  ? '0 15px 40px rgba(0,0,0,0.5), inset 0 0 12px rgba(0,0,0,0.6)'
                  : '0 2px 10px rgba(0,0,0,0.3), inset 0 0 12px rgba(0,0,0,0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 12px',
                fontFamily: "'Carnivalee Freakshow', serif",
                fontSize: '32px',
                textAlign: 'center',
                // Sway animation takes priority when active
                animation: animationStyle,
                // Position transition
                transition: `
                  top 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${dealDelay}s,
                  transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${dealDelay}s,
                  opacity 0.15s ease ${menuOpen ? dealDelay : (0.5 + closeDelay)}s,
                  visibility 0s linear ${menuOpen ? '0s' : (0.7 + closeDelay) + 's'},
                  box-shadow 0.5s ease ${dealDelay}s
                `,
                // Hide completely when closed
                opacity: menuOpen ? 1 : 0,
                visibility: menuOpen ? 'visible' : 'hidden',
                pointerEvents: menuOpen ? 'auto' : 'none',
                // Panel 1 (top) should always be on top of stack
                zIndex: 1004 - index
              }}
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Clicked menu item: ${item.label}`);
                
                // Trigger sway animation
                if (swayingFromPanel === null) {
                  setSwayAnimKey(prev => prev + 1);
                  setSwayingFromPanel(item.id);
                  
                  // Reset after animation completes (2.5s + max delay of 0.36s)
                  setTimeout(() => {
                    setSwayingFromPanel(null);
                  }, 3000);
                }
              }}
            >
              <span className="carved-text">{item.label}</span>
              
              {/* Top rope connectors */}
              {item.hasTopRope && (
                <>
                  <div style={{
                    ...ropeStyle,
                    left: '15px',
                    top: '-20px'
                  }} />
                  <div style={{
                    ...ropeStyle,
                    right: '15px',
                    top: '-20px'
                  }} />
                </>
              )}
              
              {/* Bottom rope connectors */}
              {item.hasBottomRope && (
                <>
                  <div style={{
                    ...ropeStyle,
                    left: '15px',
                    bottom: '-20px'
                  }} />
                  <div style={{
                    ...ropeStyle,
                    right: '15px',
                    bottom: '-20px'
                  }} />
                </>
              )}
            </div>
          );
        })}
        
        {/* Smoke poof effect when menu opens/closes */}
        {showSmokePoof && (
          <React.Fragment key={smokeAnimKey}>
            {/* Main smoke cloud - larger for wider coverage */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(140,120,100,0.95) 0%, rgba(120,100,80,0.8) 25%, rgba(100,80,60,0.5) 50%, rgba(80,60,40,0.2) 75%, transparent 90%)',
              animation: 'smokePoof 1.0s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 1005,
              filter: 'blur(12px)'
            }} />
            
            {/* Smoke wisp 1 - drifts up-left */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '120px',
              height: '90px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(130,110,90,0.9) 0%, rgba(110,90,70,0.6) 50%, transparent 85%)',
              animation: 'smokeWisp1 1.4s ease-out forwards',
              animationDelay: '0.05s',
              pointerEvents: 'none',
              zIndex: 1006,
              filter: 'blur(8px)'
            }} />
            
            {/* Smoke wisp 2 - drifts up-right */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '100px',
              height: '75px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(120,100,80,0.9) 0%, rgba(100,80,60,0.6) 50%, transparent 85%)',
              animation: 'smokeWisp2 1.3s ease-out forwards',
              animationDelay: '0.1s',
              pointerEvents: 'none',
              zIndex: 1006,
              filter: 'blur(7px)'
            }} />
            
            {/* Smoke wisp 3 - drifts up-center */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '140px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(150,130,110,0.85) 0%, rgba(130,110,90,0.5) 50%, transparent 85%)',
              animation: 'smokeWisp3 1.5s ease-out forwards',
              animationDelay: '0.02s',
              pointerEvents: 'none',
              zIndex: 1006,
              filter: 'blur(10px)'
            }} />
            
            {/* Inner bright flash */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(255,240,200,0.7) 0%, rgba(220,200,160,0.4) 40%, transparent 70%)',
              animation: 'smokePoof 0.5s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 1004,
              filter: 'blur(6px)'
            }} />
            
            {/* Lingering smoke - drifts left */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '200px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(130,115,95,0.7) 0%, rgba(110,95,75,0.4) 50%, transparent 85%)',
              animation: 'smokeLingerLeft 3.0s ease-out forwards',
              animationDelay: '0.2s',
              pointerEvents: 'none',
              zIndex: 1003,
              filter: 'blur(15px)'
            }} />
            
            {/* Lingering smoke - drifts right */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '180px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(125,110,90,0.7) 0%, rgba(105,90,70,0.4) 50%, transparent 85%)',
              animation: 'smokeLingerRight 3.2s ease-out forwards',
              animationDelay: '0.15s',
              pointerEvents: 'none',
              zIndex: 1003,
              filter: 'blur(14px)'
            }} />
            
            {/* Lingering smoke - drifts up */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '250px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(140,120,100,0.65) 0%, rgba(120,100,80,0.35) 50%, transparent 85%)',
              animation: 'smokeLingerUp 3.5s ease-out forwards',
              animationDelay: '0.1s',
              pointerEvents: 'none',
              zIndex: 1003,
              filter: 'blur(18px)'
            }} />
            
            {/* Lingering smoke - drifts down slightly */}
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '38%',
              width: '160px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(120,105,85,0.6) 0%, rgba(100,85,65,0.3) 50%, transparent 85%)',
              animation: 'smokeLingerDown 2.8s ease-out forwards',
              animationDelay: '0.25s',
              pointerEvents: 'none',
              zIndex: 1003,
              filter: 'blur(12px)'
            }} />
          </React.Fragment>
        )}
        
        {/* Menu Logo - appears below menu panels */}
        {menuHasBeenOpened && (
          <div style={{
            position: 'fixed',
            left: '50%',
            top: 'calc(38% + 205px)',
            transform: 'translateX(-50%)',
            width: '240px',
            height: 'auto',
            opacity: showMenuLogo ? 1 : 0,
            // When showMenuLogo is false, we're about to fade IN (use 1s)
            // When showMenuLogo is true, we're about to fade OUT (use 2.9s)
            transition: showMenuLogo 
              ? 'opacity 2.9s ease-in-out' 
              : 'opacity 1s ease-in-out',
            pointerEvents: 'none',
            zIndex: 1002
          }}>
            <img 
              src="story-portal-logo.svg"
              alt="The Story Portal"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        
        <div className="nav-buttons" style={{
          position: 'absolute',
          right: '140px',
          top: '34%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {/* HOW TO PLAY Button - Two-layer backlit effect */}
          <div 
            className="secondary-button"
            onClick={() => setView('about')}
            onMouseDown={() => setHowToPlayPressed(true)}
            onMouseUp={() => setHowToPlayPressed(false)}
            onMouseLeave={() => setHowToPlayPressed(false)}
            onTouchStart={() => setHowToPlayPressed(true)}
            onTouchEnd={() => setHowToPlayPressed(false)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              width: '280px',
              height: '56px',
              transform: howToPlayPressed ? 'translateY(2px)' : 'translateY(0)',
              ...(howToPlayPressed ? buttonShadowPressedStyle : buttonShadowStyle)
            }}
          >
            {/* LAYER 3 (TOP): Button with EXTRUDED TEXT effect */}
            {!hideTopLayer && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '280px',
              height: '56px',
              zIndex: 3
            }}>
              <svg 
                viewBox="0 0 280 56" 
                style={{
                  width: '280px',
                  height: '56px',
                  display: 'block',
                  overflow: 'visible'
                }}
              >
                <defs>
                  {/* Texture pattern from button for text fill */}
                  <pattern id="metal-texture-htp" patternUnits="userSpaceOnUse" width="280" height="56">
                    <image href="story-portal-button-secondary.webp" width="280" height="56"/>
                  </pattern>
                  
                  {/* Gradient for front face - lighter for readability */}
                  <linearGradient id="face-gradient-htp" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={faceTopColor}/>
                    <stop offset={`${faceGradientMidStop}%`} stopColor={faceMidColor}/>
                    <stop offset="100%" stopColor={faceBottomColor}/>
                  </linearGradient>
                  
                  {/* Inner bevel highlight */}
                  <linearGradient id="bevel-highlight-htp" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={highlightTopColor} stopOpacity={highlightTopOpacity}/>
                    <stop offset={`${highlightMidStop}%`} stopColor={highlightMidColor} stopOpacity={highlightMidOpacity}/>
                    <stop offset="100%" stopColor={highlightBottomColor} stopOpacity={highlightBottomOpacity}/>
                  </linearGradient>
                  
                  {/* Texture opacity gradient - controls where texture is more/less visible */}
                  {/* SVG masks use LUMINANCE, so we convert opacity to grayscale: white=visible, black=hidden */}
                  {/* Using gradientUnits="userSpaceOnUse" for precise positioning */}
                  {textureGradientType === 'vertical' && (
                    <linearGradient id="texture-opacity-gradient-htp" gradientUnits="userSpaceOnUse" x1="140" y1="0" x2="140" y2="56">
                      <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                      <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                      <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                    </linearGradient>
                  )}
                  {textureGradientType === 'horizontal' && (
                    <linearGradient id="texture-opacity-gradient-htp" gradientUnits="userSpaceOnUse" x1="0" y1="28" x2="280" y2="28">
                      <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                      <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                      <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                    </linearGradient>
                  )}
                  {textureGradientType === 'radial' && (
                    <radialGradient id="texture-opacity-gradient-htp" gradientUnits="userSpaceOnUse" cx="140" cy="28" r="140">
                      <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                      <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                      <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                    </radialGradient>
                  )}
                  
                  {/* Mask using the texture opacity gradient */}
                  <mask id="texture-mask-htp" maskUnits="userSpaceOnUse" x="0" y="0" width="280" height="56">
                    <rect x="0" y="0" width="280" height="56" fill={textureGradientEnabled ? "url(#texture-opacity-gradient-htp)" : "white"}/>
                  </mask>
                  
                  {/* Shadow filter for depth */}
                  <filter id="extrude-shadow-htp" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx={textShadowOffsetX} dy={textShadowOffsetY} stdDeviation={textShadowBlur} floodColor={textShadowColor} floodOpacity={textShadowEnabled ? textShadowOpacity : 0}/>
                  </filter>
                </defs>
                
                {/* Button base - NO knockout, full image */}
                <image href="story-portal-button-secondary.webp" width="280" height="56"/>
                
                {/* EXTRUDED TEXT LAYERS - back to front */}
                <g transform="translate(140, 28)">
                  {/* Extrusion layers - deepest to shallowest */}
                  {extrudeLayers.map((layer, i) => (
                    <g key={`extrude-htp-${i}`} transform={`translate(${layer.offsetX}, ${layer.offsetY})`}>
                      <text x="-91" y="0" 
                        fill={`rgb(${layer.r}, ${layer.g}, ${layer.b})`}
                        stroke={outerStrokeEnabled && i === 0 ? outerStrokeColor : 'none'}
                        strokeWidth={outerStrokeEnabled && i === 0 ? outerStrokeWidth : 0}
                        fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" 
                        style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>person_play</text>
                      <text x="-58" y="2" 
                        fill={`rgb(${layer.r}, ${layer.g}, ${layer.b})`}
                        stroke={outerStrokeEnabled && i === 0 ? outerStrokeColor : 'none'}
                        strokeWidth={outerStrokeEnabled && i === 0 ? outerStrokeWidth : 0}
                        fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">HOW TO PLAY</text>
                    </g>
                  ))}
                  
                  {/* Front face with gradient */}
                  <g filter={textShadowEnabled ? "url(#extrude-shadow-htp)" : undefined}>
                    <text x="-91" y="0" fill="url(#face-gradient-htp)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>person_play</text>
                    <text x="-58" y="2" fill="url(#face-gradient-htp)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">HOW TO PLAY</text>
                  </g>
                  
                  {/* Top highlight/bevel */}
                  {highlightEnabled && (
                    <g>
                      <text x="-91" y="0" fill="url(#bevel-highlight-htp)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>person_play</text>
                      <text x="-58" y="2" fill="url(#bevel-highlight-htp)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">HOW TO PLAY</text>
                    </g>
                  )}
                </g>
                
                {/* Texture overlay - OUTSIDE transformed group so mask coordinates align */}
                {textureOverlayEnabled && (
                  <g opacity={textureOverlayOpacity} style={{mixBlendMode: textureBlendMode}} mask={textureGradientEnabled ? "url(#texture-mask-htp)" : undefined}>
                    <text x="49" y="28" fill="url(#metal-texture-htp)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>person_play</text>
                    <text x="82" y="30" fill="url(#metal-texture-htp)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">HOW TO PLAY</text>
                  </g>
                )}
              </svg>
            </div>
            )}
          </div>
          
          {/* MY STORIES Button - Two-layer backlit effect */}
          <div 
            className="secondary-button"
            onClick={() => setView('stories')}
            onMouseDown={() => setMyStoriesPressed(true)}
            onMouseUp={() => setMyStoriesPressed(false)}
            onMouseLeave={() => setMyStoriesPressed(false)}
            onTouchStart={() => setMyStoriesPressed(true)}
            onTouchEnd={() => setMyStoriesPressed(false)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              width: '280px',
              height: '56px',
              transform: myStoriesPressed ? 'translateY(2px)' : 'translateY(0)',
              ...(myStoriesPressed ? buttonShadowPressedStyle : buttonShadowStyle)
            }}
          >
            {/* LAYER 3 (TOP): Button with EXTRUDED TEXT effect */}
            {!hideTopLayer && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '280px',
              height: '56px',
              zIndex: 3
            }}>
              <svg 
                viewBox="0 0 280 56" 
                style={{
                  width: '280px',
                  height: '56px',
                  display: 'block',
                  overflow: 'visible'
                }}
              >
                <defs>
                  {/* Texture pattern from button for text fill */}
                  <pattern id="metal-texture-mys" patternUnits="userSpaceOnUse" width="280" height="56">
                    <image href="story-portal-button-secondary.webp" width="280" height="56"/>
                  </pattern>
                  
                  {/* Gradient for front face */}
                  <linearGradient id="face-gradient-mys" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={faceTopColor}/>
                    <stop offset={`${faceGradientMidStop}%`} stopColor={faceMidColor}/>
                    <stop offset="100%" stopColor={faceBottomColor}/>
                  </linearGradient>
                  
                  {/* Inner bevel highlight */}
                  <linearGradient id="bevel-highlight-mys" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={highlightTopColor} stopOpacity={highlightTopOpacity}/>
                    <stop offset={`${highlightMidStop}%`} stopColor={highlightMidColor} stopOpacity={highlightMidOpacity}/>
                    <stop offset="100%" stopColor={highlightBottomColor} stopOpacity={highlightBottomOpacity}/>
                  </linearGradient>
                  
                  {/* Texture opacity gradient - using luminance for SVG masks */}
                  {/* Using gradientUnits="userSpaceOnUse" for precise positioning */}
                  {textureGradientType === 'vertical' && (
                    <linearGradient id="texture-opacity-gradient-mys" gradientUnits="userSpaceOnUse" x1="140" y1="0" x2="140" y2="56">
                      <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                      <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                      <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                    </linearGradient>
                  )}
                  {textureGradientType === 'horizontal' && (
                    <linearGradient id="texture-opacity-gradient-mys" gradientUnits="userSpaceOnUse" x1="0" y1="28" x2="280" y2="28">
                      <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                      <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                      <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                    </linearGradient>
                  )}
                  {textureGradientType === 'radial' && (
                    <radialGradient id="texture-opacity-gradient-mys" gradientUnits="userSpaceOnUse" cx="140" cy="28" r="140">
                      <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                      <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                      <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                    </radialGradient>
                  )}
                  
                  {/* Mask using the texture opacity gradient */}
                  <mask id="texture-mask-mys" maskUnits="userSpaceOnUse" x="0" y="0" width="280" height="56">
                    <rect x="0" y="0" width="280" height="56" fill={textureGradientEnabled ? "url(#texture-opacity-gradient-mys)" : "white"}/>
                  </mask>
                  
                  {/* Shadow filter for depth */}
                  <filter id="extrude-shadow-mys" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx={textShadowOffsetX} dy={textShadowOffsetY} stdDeviation={textShadowBlur} floodColor={textShadowColor} floodOpacity={textShadowEnabled ? textShadowOpacity : 0}/>
                  </filter>
                </defs>
                
                {/* Button base - NO knockout, full image */}
                <image href="story-portal-button-secondary.webp" width="280" height="56"/>
                
                {/* EXTRUDED TEXT LAYERS - back to front */}
                <g transform="translate(140, 28)">
                  {/* Extrusion layers - deepest to shallowest */}
                  {extrudeLayers.map((layer, i) => (
                    <g key={`extrude-mys-${i}`} transform={`translate(${layer.offsetX}, ${layer.offsetY})`}>
                      <text x="-84" y="0" 
                        fill={`rgb(${layer.r}, ${layer.g}, ${layer.b})`}
                        stroke={outerStrokeEnabled && i === 0 ? outerStrokeColor : 'none'}
                        strokeWidth={outerStrokeEnabled && i === 0 ? outerStrokeWidth : 0}
                        fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" 
                        style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>web_stories</text>
                      <text x="-49" y="3" 
                        fill={`rgb(${layer.r}, ${layer.g}, ${layer.b})`}
                        stroke={outerStrokeEnabled && i === 0 ? outerStrokeColor : 'none'}
                        strokeWidth={outerStrokeEnabled && i === 0 ? outerStrokeWidth : 0}
                        fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">MY STORIES</text>
                    </g>
                  ))}
                  
                  {/* Front face with gradient */}
                  <g filter={textShadowEnabled ? "url(#extrude-shadow-mys)" : undefined}>
                    <text x="-84" y="0" fill="url(#face-gradient-mys)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>web_stories</text>
                    <text x="-49" y="3" fill="url(#face-gradient-mys)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">MY STORIES</text>
                  </g>
                  
                  {/* Top highlight/bevel */}
                  {highlightEnabled && (
                    <g>
                      <text x="-84" y="0" fill="url(#bevel-highlight-mys)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>web_stories</text>
                      <text x="-49" y="3" fill="url(#bevel-highlight-mys)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">MY STORIES</text>
                    </g>
                  )}
                </g>
                
                {/* Texture overlay - OUTSIDE transformed group so mask coordinates align */}
                {textureOverlayEnabled && (
                  <g opacity={textureOverlayOpacity} style={{mixBlendMode: textureBlendMode}} mask={textureGradientEnabled ? "url(#texture-mask-mys)" : undefined}>
                    <text x="56" y="28" fill="url(#metal-texture-mys)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>web_stories</text>
                    <text x="91" y="31" fill="url(#metal-texture-mys)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">MY STORIES</text>
                  </g>
                )}
              </svg>
            </div>
            )}
          </div>
        </div>
        
        {/* 3X SCALED BUTTON PREVIEW - shown when toggled on */}
        {showEffectPanel && show3xPreview && (
          <div style={{
            position: 'fixed',
            left: '10px',
            top: '0px',
            zIndex: 2001,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            {/* HOW TO PLAY Preview - 3x scale with EXTRUDED TEXT */}
            <div style={{
              position: 'relative',
              width: `${280 * 3}px`,
              height: `${56 * 3}px`
            }}>
              {/* Top button layer with extruded text - scaled 3x */}
              {!hideTopLayer && (
                <div style={{position: 'absolute', top: 0, left: 0, width: `${280 * 3}px`, height: `${56 * 3}px`, zIndex: 3}}>
                  <svg viewBox="0 0 280 56" style={{width: `${280 * 3}px`, height: `${56 * 3}px`, display: 'block', overflow: 'visible'}}>
                    <defs>
                      {/* Texture pattern */}
                      <pattern id="metal-texture-preview" patternUnits="userSpaceOnUse" width="280" height="56">
                        <image href="story-portal-button-secondary.webp" width="280" height="56"/>
                      </pattern>
                      
                      {/* Gradient for front face */}
                      <linearGradient id="face-gradient-preview" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={faceTopColor}/>
                        <stop offset={`${faceGradientMidStop}%`} stopColor={faceMidColor}/>
                        <stop offset="100%" stopColor={faceBottomColor}/>
                      </linearGradient>
                      
                      {/* Inner bevel highlight */}
                      <linearGradient id="bevel-highlight-preview" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={highlightTopColor} stopOpacity={highlightTopOpacity}/>
                        <stop offset={`${highlightMidStop}%`} stopColor={highlightMidColor} stopOpacity={highlightMidOpacity}/>
                        <stop offset="100%" stopColor={highlightBottomColor} stopOpacity={highlightBottomOpacity}/>
                      </linearGradient>
                      
                      {/* Texture opacity gradient - using luminance for SVG masks */}
                      {/* Using gradientUnits="userSpaceOnUse" for precise positioning */}
                      {textureGradientType === 'vertical' && (
                        <linearGradient id="texture-opacity-gradient-preview" gradientUnits="userSpaceOnUse" x1="140" y1="0" x2="140" y2="56">
                          <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                          <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                          <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                        </linearGradient>
                      )}
                      {textureGradientType === 'horizontal' && (
                        <linearGradient id="texture-opacity-gradient-preview" gradientUnits="userSpaceOnUse" x1="0" y1="28" x2="280" y2="28">
                          <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                          <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                          <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                        </linearGradient>
                      )}
                      {textureGradientType === 'radial' && (
                        <radialGradient id="texture-opacity-gradient-preview" gradientUnits="userSpaceOnUse" cx="140" cy="28" r="140">
                          <stop offset="0%" stopColor={`rgb(${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)}, ${Math.round(textureGradientMidOpacity * 255)})`}/>
                          <stop offset={`${textureGradientMidStop}%`} stopColor={`rgb(${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)}, ${Math.round(textureGradientTopOpacity * 255)})`}/>
                          <stop offset="100%" stopColor={`rgb(${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)}, ${Math.round(textureGradientBottomOpacity * 255)})`}/>
                        </radialGradient>
                      )}
                      
                      {/* Mask using the texture opacity gradient */}
                      <mask id="texture-mask-preview" maskUnits="userSpaceOnUse" x="0" y="0" width="280" height="56">
                        <rect x="0" y="0" width="280" height="56" fill={textureGradientEnabled ? "url(#texture-opacity-gradient-preview)" : "white"}/>
                      </mask>
                      
                      {/* Shadow filter */}
                      <filter id="extrude-shadow-preview" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx={textShadowOffsetX} dy={textShadowOffsetY} stdDeviation={textShadowBlur} floodColor={textShadowColor} floodOpacity={textShadowEnabled ? textShadowOpacity : 0}/>
                      </filter>
                    </defs>
                    
                    {/* Button base */}
                    <image href="story-portal-button-secondary.webp" width="280" height="56"/>
                    
                    {/* EXTRUDED TEXT */}
                    <g transform="translate(140, 28)">
                      {/* Extrusion layers */}
                      {extrudeLayers.map((layer, i) => (
                        <g key={`extrude-preview-${i}`} transform={`translate(${layer.offsetX}, ${layer.offsetY})`}>
                          <text x="-91" y="0" 
                            fill={`rgb(${layer.r}, ${layer.g}, ${layer.b})`}
                            stroke={outerStrokeEnabled && i === 0 ? outerStrokeColor : 'none'}
                            strokeWidth={outerStrokeEnabled && i === 0 ? outerStrokeWidth : 0}
                            fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" 
                            style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>person_play</text>
                          <text x="-58" y="2" 
                            fill={`rgb(${layer.r}, ${layer.g}, ${layer.b})`}
                            stroke={outerStrokeEnabled && i === 0 ? outerStrokeColor : 'none'}
                            strokeWidth={outerStrokeEnabled && i === 0 ? outerStrokeWidth : 0}
                            fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">HOW TO PLAY</text>
                        </g>
                      ))}
                      
                      {/* Front face */}
                      <g filter={textShadowEnabled ? "url(#extrude-shadow-preview)" : undefined}>
                        <text x="-91" y="0" fill="url(#face-gradient-preview)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>person_play</text>
                        <text x="-58" y="2" fill="url(#face-gradient-preview)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">HOW TO PLAY</text>
                      </g>
                      
                      {/* Highlight */}
                      {highlightEnabled && (
                        <g>
                          <text x="-91" y="0" fill="url(#bevel-highlight-preview)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>person_play</text>
                          <text x="-58" y="2" fill="url(#bevel-highlight-preview)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">HOW TO PLAY</text>
                        </g>
                      )}
                    </g>
                    
                    {/* Texture overlay - OUTSIDE transformed group so mask coordinates align */}
                    {textureOverlayEnabled && (
                      <g opacity={textureOverlayOpacity} style={{mixBlendMode: textureBlendMode}} mask={textureGradientEnabled ? "url(#texture-mask-preview)" : undefined}>
                        <text x="49" y="28" fill="url(#metal-texture-preview)" fontFamily="Material Symbols Outlined" fontSize="26" dominantBaseline="central" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>person_play</text>
                        <text x="82" y="30" fill="url(#metal-texture-preview)" fontFamily="Molly Sans, sans-serif" fontSize="22" dominantBaseline="central" letterSpacing="1">HOW TO PLAY</text>
                      </g>
                    )}
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Extruded Text Effect Control Panel */}
        {showEffectPanel && (
          <div style={{
            position: 'fixed',
            left: '10px',
            bottom: '10px',
            width: '360px',
            maxHeight: '85vh',
            background: 'rgba(0,0,0,0.95)',
            borderRadius: '12px',
            border: '2px solid #8B6F47',
            zIndex: 2000,
            color: '#f5deb3',
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{padding: '12px 16px', borderBottom: '1px solid #555', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontWeight: 'bold', fontSize: '14px'}}>🔩 Extruded Text Controls</span>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <button 
                  onClick={() => setShow3xPreview(!show3xPreview)}
                  style={{
                    background: show3xPreview ? '#5a4830' : 'transparent', 
                    border: '1px solid #8B6F47', 
                    borderRadius: '4px',
                    color: '#f5deb3', 
                    cursor: 'pointer', 
                    fontSize: '10px',
                    padding: '4px 8px'
                  }}
                >{show3xPreview ? '3× ON' : '3× OFF'}</button>
                <button 
                  onClick={() => setShowEffectPanel(false)}
                  style={{background: 'none', border: 'none', color: '#f5deb3', cursor: 'pointer', fontSize: '18px'}}
                >×</button>
              </div>
            </div>
            
            {/* Page Tabs */}
            <div style={{display: 'flex', borderBottom: '1px solid #555'}}>
              {['Extrusion', 'Face', 'Highlight', 'Shadow', 'Extras', 'Btn Shadow'].map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setEffectPage(idx)}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    background: effectPage === idx ? '#5a4830' : 'transparent',
                    border: 'none',
                    borderBottom: effectPage === idx ? '2px solid #f5deb3' : '2px solid transparent',
                    color: effectPage === idx ? '#fff' : '#999',
                    cursor: 'pointer',
                    fontSize: '9px',
                    fontWeight: effectPage === idx ? 'bold' : 'normal'
                  }}
                >{tab}</button>
              ))}
            </div>
            
            {/* Scrollable Content */}
            <div style={{padding: '16px', overflowY: 'auto', flex: 1}}>
              
              {/* Page 0: Extrusion Geometry & Colors */}
              {effectPage === 0 && (
                <div>
                  <p style={{color: '#aaa', marginBottom: '12px', fontSize: '10px'}}>Controls the 3D extrusion depth, direction, and color progression from back (darkest) to front.</p>
                  
                  <div style={{marginBottom: '12px', padding: '8px', background: '#442222', borderRadius: '6px'}}>
                    <div style={{fontWeight: 'bold', color: '#ff9999', marginBottom: '8px'}}>👁️ Debug</div>
                    <label style={{display: 'flex', alignItems: 'center'}}>
                      <input type="checkbox" checked={hideTopLayer} onChange={(e) => setHideTopLayer(e.target.checked)} style={{marginRight: '8px'}}/>
                      <span>Hide Extruded Text Layer</span>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginBottom: '8px', color: '#d4b892'}}>📐 Geometry</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Depth Layers: {extrudeDepth}</span>
                      <input type="range" min="1" max="16" step="1" value={extrudeDepth} onChange={(e) => setExtrudeDepth(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Max Offset: {extrudeMaxOffset}px</span>
                      <input type="range" min="1" max="10" step="0.5" value={extrudeMaxOffset} onChange={(e) => setExtrudeMaxOffset(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>X Direction: {extrudeOffsetX.toFixed(2)}</span>
                      <input type="range" min="-1" max="1" step="0.05" value={extrudeOffsetX} onChange={(e) => setExtrudeOffsetX(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Y Direction: {extrudeOffsetY.toFixed(2)}</span>
                      <input type="range" min="-1" max="1" step="0.05" value={extrudeOffsetY} onChange={(e) => setExtrudeOffsetY(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: '#d4b892'}}>🎨 Base Color (Darkest/Back)</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Red: {extrudeBaseR}</span>
                      <input type="range" min="0" max="255" step="1" value={extrudeBaseR} onChange={(e) => setExtrudeBaseR(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Green: {extrudeBaseG}</span>
                      <input type="range" min="0" max="255" step="1" value={extrudeBaseG} onChange={(e) => setExtrudeBaseG(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Blue: {extrudeBaseB}</span>
                      <input type="range" min="0" max="255" step="1" value={extrudeBaseB} onChange={(e) => setExtrudeBaseB(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: '#d4b892'}}>📈 Color Step (Per Layer)</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>R Step: +{extrudeStepR}</span>
                      <input type="range" min="0" max="20" step="1" value={extrudeStepR} onChange={(e) => setExtrudeStepR(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>G Step: +{extrudeStepG}</span>
                      <input type="range" min="0" max="20" step="1" value={extrudeStepG} onChange={(e) => setExtrudeStepG(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>B Step: +{extrudeStepB}</span>
                      <input type="range" min="0" max="20" step="1" value={extrudeStepB} onChange={(e) => setExtrudeStepB(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginTop: '12px', padding: '8px', background: '#333', borderRadius: '6px'}}>
                    <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                      {extrudeLayers.slice(0, 8).map((layer, i) => (
                        <div key={i} style={{
                          width: '30px', height: '20px', 
                          background: `rgb(${layer.r}, ${layer.g}, ${layer.b})`,
                          borderRadius: '3px',
                          border: '1px solid #555'
                        }}/>
                      ))}
                    </div>
                    <div style={{fontSize: '9px', color: '#888', marginTop: '4px'}}>Layer colors (back → front)</div>
                  </div>
                </div>
              )}
              
              {/* Page 1: Front Face Gradient */}
              {effectPage === 1 && (
                <div>
                  <p style={{color: '#aaa', marginBottom: '12px', fontSize: '10px'}}>Controls the front face gradient - the readable surface of the text.</p>
                  
                  <div style={{fontWeight: 'bold', marginBottom: '8px', color: '#d4b892'}}>🎨 Face Gradient</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Top Color:</span>
                      <input type="color" value={faceTopColor} onChange={(e) => setFaceTopColor(e.target.value)} style={{width: '60px', height: '24px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Mid Color:</span>
                      <input type="color" value={faceMidColor} onChange={(e) => setFaceMidColor(e.target.value)} style={{width: '60px', height: '24px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Mid Stop: {faceGradientMidStop}%</span>
                      <input type="range" min="10" max="90" step="5" value={faceGradientMidStop} onChange={(e) => setFaceGradientMidStop(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Bottom Color:</span>
                      <input type="color" value={faceBottomColor} onChange={(e) => setFaceBottomColor(e.target.value)} style={{width: '60px', height: '24px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginTop: '12px', padding: '8px', background: '#333', borderRadius: '6px'}}>
                    <div style={{
                      width: '100%', height: '40px', 
                      background: `linear-gradient(180deg, ${faceTopColor} 0%, ${faceMidColor} ${faceGradientMidStop}%, ${faceBottomColor} 100%)`,
                      borderRadius: '4px'
                    }}/>
                    <div style={{fontSize: '9px', color: '#888', marginTop: '4px'}}>Face gradient preview</div>
                  </div>
                </div>
              )}
              
              {/* Page 2: Highlight/Bevel */}
              {effectPage === 2 && (
                <div>
                  <p style={{color: '#aaa', marginBottom: '12px', fontSize: '10px'}}>Controls the highlight/bevel gradient on top of the front face for a 3D look.</p>
                  
                  <label style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                    <input type="checkbox" checked={highlightEnabled} onChange={(e) => setHighlightEnabled(e.target.checked)} style={{marginRight: '8px'}}/>
                    <span style={{fontWeight: 'bold'}}>Enable Highlight</span>
                  </label>
                  
                  <div style={{fontWeight: 'bold', marginBottom: '8px', color: '#d4b892'}}>✨ Top Highlight</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Color:</span>
                      <input type="color" value={highlightTopColor} onChange={(e) => setHighlightTopColor(e.target.value)} style={{width: '60px', height: '24px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Opacity: {highlightTopOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={highlightTopOpacity} onChange={(e) => setHighlightTopOpacity(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: '#d4b892'}}>🔅 Mid Transition</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Color:</span>
                      <input type="color" value={highlightMidColor} onChange={(e) => setHighlightMidColor(e.target.value)} style={{width: '60px', height: '24px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Opacity: {highlightMidOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={highlightMidOpacity} onChange={(e) => setHighlightMidOpacity(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Stop Position: {highlightMidStop}%</span>
                      <input type="range" min="10" max="90" step="5" value={highlightMidStop} onChange={(e) => setHighlightMidStop(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: '#d4b892'}}>⬇️ Bottom</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Color:</span>
                      <input type="color" value={highlightBottomColor} onChange={(e) => setHighlightBottomColor(e.target.value)} style={{width: '60px', height: '24px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Opacity: {highlightBottomOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={highlightBottomOpacity} onChange={(e) => setHighlightBottomOpacity(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Page 3: Text Shadow */}
              {effectPage === 3 && (
                <div>
                  <p style={{color: '#aaa', marginBottom: '12px', fontSize: '10px'}}>Drop shadow under the front face text for depth.</p>
                  
                  <label style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                    <input type="checkbox" checked={textShadowEnabled} onChange={(e) => setTextShadowEnabled(e.target.checked)} style={{marginRight: '8px'}}/>
                    <span style={{fontWeight: 'bold'}}>Enable Text Shadow</span>
                  </label>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Color:</span>
                      <input type="color" value={textShadowColor} onChange={(e) => setTextShadowColor(e.target.value)} style={{width: '60px', height: '24px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Offset X: {textShadowOffsetX}px</span>
                      <input type="range" min="-5" max="5" step="0.5" value={textShadowOffsetX} onChange={(e) => setTextShadowOffsetX(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Offset Y: {textShadowOffsetY}px</span>
                      <input type="range" min="-5" max="5" step="0.5" value={textShadowOffsetY} onChange={(e) => setTextShadowOffsetY(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Blur: {textShadowBlur}px</span>
                      <input type="range" min="0" max="5" step="0.5" value={textShadowBlur} onChange={(e) => setTextShadowBlur(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Opacity: {textShadowOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={textShadowOpacity} onChange={(e) => setTextShadowOpacity(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Page 4: Extras */}
              {effectPage === 4 && (
                <div>
                  <p style={{color: '#aaa', marginBottom: '12px', fontSize: '10px'}}>Additional effects: outer stroke and texture overlay.</p>
                  
                  <div style={{fontWeight: 'bold', marginBottom: '8px', color: '#d4b892'}}>🖊️ Outer Stroke</div>
                  
                  <label style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                    <input type="checkbox" checked={outerStrokeEnabled} onChange={(e) => setOuterStrokeEnabled(e.target.checked)} style={{marginRight: '8px'}}/>
                    <span style={{fontWeight: 'bold'}}>Enable Outer Stroke</span>
                  </label>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Color:</span>
                      <input type="color" value={outerStrokeColor} onChange={(e) => setOuterStrokeColor(e.target.value)} style={{width: '60px', height: '24px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Width: {outerStrokeWidth}px</span>
                      <input type="range" min="0.5" max="5" step="0.5" value={outerStrokeWidth} onChange={(e) => setOuterStrokeWidth(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: '#d4b892'}}>🏗️ Texture Overlay</div>
                  
                  <label style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                    <input type="checkbox" checked={textureOverlayEnabled} onChange={(e) => setTextureOverlayEnabled(e.target.checked)} style={{marginRight: '8px'}}/>
                    <span style={{fontWeight: 'bold'}}>Enable Texture Overlay</span>
                  </label>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Opacity: {textureOverlayOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={textureOverlayOpacity} onChange={(e) => setTextureOverlayOpacity(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Blend Mode:</span>
                      <select 
                        value={textureBlendMode} 
                        onChange={(e) => setTextureBlendMode(e.target.value)}
                        style={{background: '#333', color: '#f5deb3', border: '1px solid #555', borderRadius: '4px', padding: '4px'}}
                      >
                        <option value="overlay">Overlay</option>
                        <option value="multiply">Multiply</option>
                        <option value="soft-light">Soft Light</option>
                        <option value="hard-light">Hard Light</option>
                        <option value="color-burn">Color Burn</option>
                        <option value="color-dodge">Color Dodge</option>
                        <option value="darken">Darken</option>
                        <option value="lighten">Lighten</option>
                        <option value="normal">Normal</option>
                      </select>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: '#d4b892'}}>🎭 Texture Gradient Mask</div>
                  <p style={{color: '#888', marginBottom: '8px', fontSize: '9px'}}>Control where texture is more/less visible across the text.</p>
                  
                  <label style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                    <input type="checkbox" checked={textureGradientEnabled} onChange={(e) => setTextureGradientEnabled(e.target.checked)} style={{marginRight: '8px'}}/>
                    <span style={{fontWeight: 'bold'}}>Enable Gradient Mask</span>
                  </label>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Direction:</span>
                      <select 
                        value={textureGradientType} 
                        onChange={(e) => setTextureGradientType(e.target.value)}
                        style={{background: '#333', color: '#f5deb3', border: '1px solid #555', borderRadius: '4px', padding: '4px'}}
                      >
                        <option value="vertical">Vertical (Top→Bottom)</option>
                        <option value="horizontal">Horizontal (Left→Right)</option>
                        <option value="radial">Radial (Center→Edge)</option>
                      </select>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Top/Left Opacity: {textureGradientTopOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={textureGradientTopOpacity} onChange={(e) => setTextureGradientTopOpacity(parseFloat(e.target.value))} style={{width: '120px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Mid Opacity: {textureGradientMidOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={textureGradientMidOpacity} onChange={(e) => setTextureGradientMidOpacity(parseFloat(e.target.value))} style={{width: '120px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Mid Stop: {textureGradientMidStop}%</span>
                      <input type="range" min="10" max="90" step="5" value={textureGradientMidStop} onChange={(e) => setTextureGradientMidStop(parseInt(e.target.value))} style={{width: '120px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Bottom/Right Opacity: {textureGradientBottomOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={textureGradientBottomOpacity} onChange={(e) => setTextureGradientBottomOpacity(parseFloat(e.target.value))} style={{width: '120px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginTop: '12px', padding: '8px', background: '#333', borderRadius: '6px', fontSize: '9px', color: '#888'}}>
                    The gradient mask controls WHERE texture shows. High opacity = more texture visible. Use with overall Opacity and Blend Mode to fine-tune the rust/patina integration.
                  </div>
                </div>
              )}
              
              {/* Page 5: Button Drop Shadow */}
              {effectPage === 5 && (
                <div>
                  <p style={{color: '#aaa', marginBottom: '12px', fontSize: '10px'}}>Multi-layer drop shadow to make buttons appear raised off the background.</p>
                  
                  <label style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                    <input type="checkbox" checked={buttonShadowEnabled} onChange={(e) => setButtonShadowEnabled(e.target.checked)} style={{marginRight: '8px'}}/>
                    <span style={{fontWeight: 'bold'}}>Enable Button Shadow</span>
                  </label>
                  
                  <div style={{fontWeight: 'bold', marginBottom: '8px', color: '#d4b892'}}>📐 Position & Size</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Offset X: {buttonShadowOffsetX}px</span>
                      <input type="range" min="-20" max="20" step="1" value={buttonShadowOffsetX} onChange={(e) => setButtonShadowOffsetX(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Offset Y: {buttonShadowOffsetY}px</span>
                      <input type="range" min="0" max="30" step="1" value={buttonShadowOffsetY} onChange={(e) => setButtonShadowOffsetY(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Blur: {buttonShadowBlur}px</span>
                      <input type="range" min="0" max="40" step="1" value={buttonShadowBlur} onChange={(e) => setButtonShadowBlur(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: '#d4b892'}}>🎨 Appearance</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Opacity: {buttonShadowOpacity.toFixed(2)}</span>
                      <input type="range" min="0" max="1" step="0.05" value={buttonShadowOpacity} onChange={(e) => setButtonShadowOpacity(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: '#d4b892'}}>📚 Multi-Layer</div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Layers: {buttonShadowLayers}</span>
                      <input type="range" min="1" max="5" step="1" value={buttonShadowLayers} onChange={(e) => setButtonShadowLayers(parseInt(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Layer Multiplier: {buttonShadowLayerMult.toFixed(1)}x</span>
                      <input type="range" min="1" max="3" step="0.1" value={buttonShadowLayerMult} onChange={(e) => setButtonShadowLayerMult(parseFloat(e.target.value))} style={{width: '140px'}}/>
                    </label>
                  </div>
                  
                  <div style={{marginTop: '12px', padding: '8px', background: '#333', borderRadius: '6px', fontSize: '9px', color: '#888'}}>
                    <div style={{marginBottom: '4px', fontWeight: 'bold', color: '#aaa'}}>Generated shadows:</div>
                    {Array.from({length: buttonShadowLayers}, (_, i) => {
                      const mult = Math.pow(buttonShadowLayerMult, i);
                      const y = (buttonShadowOffsetY * mult).toFixed(1);
                      const blur = (buttonShadowBlur * mult).toFixed(1);
                      const opacity = (buttonShadowOpacity * (1 - i * 0.2)).toFixed(2);
                      return <div key={i}>Layer {i+1}: Y={y}px, blur={blur}px, opacity={opacity}</div>;
                    })}
                  </div>
                </div>
              )}
              
            </div>
            
            {/* Footer with Save */}
            <div style={{padding: '12px 16px', borderTop: '1px solid #555'}}>
              <button
                onClick={() => {
                  const settings = {
                    extrudeDepth, extrudeOffsetX, extrudeOffsetY, extrudeMaxOffset,
                    extrudeBaseR, extrudeBaseG, extrudeBaseB,
                    extrudeStepR, extrudeStepG, extrudeStepB,
                    faceTopColor, faceMidColor, faceBottomColor, faceGradientMidStop,
                    highlightEnabled, highlightTopColor, highlightTopOpacity,
                    highlightMidColor, highlightMidOpacity, highlightMidStop,
                    highlightBottomColor, highlightBottomOpacity,
                    textShadowEnabled, textShadowColor, textShadowOffsetX, textShadowOffsetY, textShadowBlur, textShadowOpacity,
                    outerStrokeEnabled, outerStrokeColor, outerStrokeWidth,
                    textureOverlayEnabled, textureOverlayOpacity, textureBlendMode,
                    textureGradientEnabled, textureGradientType, textureGradientTopOpacity, textureGradientMidOpacity, textureGradientBottomOpacity, textureGradientMidStop,
                    buttonShadowEnabled, buttonShadowOffsetX, buttonShadowOffsetY, buttonShadowBlur, buttonShadowOpacity, buttonShadowLayers, buttonShadowLayerMult
                  };
                  const jsonStr = JSON.stringify(settings, null, 2);
                  console.log('=== EXTRUDED TEXT SETTINGS ===');
                  console.log(jsonStr);
                  
                  // Copy to clipboard
                  navigator.clipboard.writeText(jsonStr).then(() => {
                    // Create a modal to show all settings
                    const modal = document.createElement('div');
                    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;';
                    modal.innerHTML = `
                      <div style="background:#1a1a1a;border:2px solid #8B6F47;border-radius:12px;padding:20px;max-width:500px;max-height:80vh;display:flex;flex-direction:column;">
                        <h3 style="color:#f5deb3;margin:0 0 10px 0;">✅ Settings Copied to Clipboard!</h3>
                        <p style="color:#aaa;margin:0 0 10px 0;font-size:12px;">Paste these to Claude to commit your settings:</p>
                        <textarea readonly style="flex:1;min-height:300px;background:#000;color:#0f0;border:1px solid #444;border-radius:4px;padding:10px;font-family:monospace;font-size:11px;resize:none;">${jsonStr}</textarea>
                        <button onclick="this.parentElement.parentElement.remove()" style="margin-top:10px;padding:10px;background:#8B6F47;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;">Close</button>
                      </div>
                    `;
                    document.body.appendChild(modal);
                  }).catch(() => {
                    // Fallback if clipboard fails
                    prompt('Copy these settings:', jsonStr);
                  });
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(180deg, #8B6F47 0%, #5a4830 100%)',
                  border: '2px solid #a08050',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                💾 Save Settings
              </button>
            </div>
          </div>
        )}
        
        
        {/* Toggle button to show effect panel */}
        {!showEffectPanel && (
          <button
            onClick={() => setShowEffectPanel(true)}
            style={{
              position: 'fixed',
              left: '10px',
              bottom: '10px',
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.9)',
              border: '2px solid #8B6F47',
              borderRadius: '8px',
              color: '#f5deb3',
              cursor: 'pointer',
              zIndex: 2000,
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🔆 Effect Controls
          </button>
        )}
        
        {/* Randomness Test Toggle Button - shown when panel is hidden */}
        {!showTestPanel && (
          <div 
            onClick={() => setShowTestPanel(true)}
            style={{
              position:'fixed',
              right:'10px',
              top:'10px',
              padding:'8px 12px',
              background:'rgba(0,0,0,0.9)',
              borderRadius:'6px',
              border:'2px solid #8B6F47',
              color:'#f5deb3',
              cursor:'pointer',
              zIndex:1000,
              fontSize:'11px',
              fontWeight:'bold',
              userSelect:'none',
              WebkitTapHighlightColor:'transparent'
            }}
          >
            🎲 Test
          </div>
        )}
        
        {/* Randomness Test Panel */}
        {showTestPanel && (
        <div style={{position:'fixed',right:'10px',top:'10px',padding:'12px',background:'rgba(0,0,0,0.95)',borderRadius:'8px',border:'2px solid #8B6F47',width:'320px',zIndex:1000,maxHeight:'calc(100vh - 20px)',overflowY:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
            <div style={{color:'#f5deb3',fontWeight:'bold',fontSize:'14px'}}>Randomness Test</div>
            <div 
              onClick={() => setShowTestPanel(false)}
              style={{
                padding:'2px 8px',
                background:'#4a3a3a',
                borderRadius:'4px',
                border:'1px solid #8a5a5a',
                color:'#f5deb3',
                cursor:'pointer',
                fontSize:'12px',
                userSelect:'none',
                WebkitTapHighlightColor:'transparent'
              }}
            >✕</div>
          </div>
          
          {/* Manual Tracking Section */}
          <div style={{marginBottom:'10px',paddingBottom:'8px',borderBottom:'1px solid #8B6F47'}}>
            <div style={{color:'#4af',fontSize:'10px',textAlign:'center',marginBottom:'6px',fontWeight:'bold'}}>MANUAL TRACKING</div>
            <div style={{display:'flex',gap:'6px',justifyContent:'center',marginBottom:'6px'}}>
              {!manualTracking ? (
                <button onClick={startManualTracking} disabled={realTimeTest} style={{padding:'5px 12px',borderRadius:'4px',background:'#2a3a4a',border:'1px solid #4a7aaa',color:'#f5deb3',cursor: realTimeTest ? 'not-allowed' : 'pointer',fontSize:'11px'}}>Start Tracking</button>
              ) : (
                <>
                  <button onClick={stopManualTracking} style={{padding:'5px 12px',borderRadius:'4px',background:'#4a3a2a',border:'1px solid #aa7a4a',color:'#f5deb3',cursor:'pointer',fontSize:'11px'}}>Stop & Results</button>
                  <button onClick={resetManualTracking} style={{padding:'5px 12px',borderRadius:'4px',background:'#3a2a2a',border:'1px solid #8a4a4a',color:'#f5deb3',cursor:'pointer',fontSize:'11px'}}>Reset</button>
                </>
              )}
            </div>
            {manualTracking && (
              <div style={{color:'#4af',fontSize:'11px',textAlign:'center'}}>
                Tracking: {manualLandings.length} spins recorded
              </div>
            )}
          </div>
          
          {/* Automated Tests Section */}
          <div style={{marginBottom:'10px',paddingBottom:'8px',borderBottom:'1px solid #8B6F47'}}>
            <div style={{color:'#aaa',fontSize:'9px',textAlign:'center',marginBottom:'4px'}}>SIMULATED (instant)</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(6, 1fr)',gap:'3px',marginBottom:'8px'}}>
              {[5, 10, 15, 20, 50, 100].map(n => (
                <button key={`sim-${n}`} onClick={() => runRandomnessTest(n)} disabled={realTimeTest || manualTracking} style={{padding:'3px 2px',borderRadius:'4px',background: (realTimeTest || manualTracking) ? '#333' : '#5a3a2a',border:'1px solid #8B6F47',color:'#f5deb3',cursor: (realTimeTest || manualTracking) ? 'not-allowed' : 'pointer',fontSize:'9px'}}>{n}</button>
              ))}
            </div>
            
            <div style={{color:'#4f4',fontSize:'9px',textAlign:'center',marginBottom:'4px'}}>REAL-TIME (auto spins)</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(6, 1fr)',gap:'3px'}}>
              {[5, 10, 15, 20, 50, 100].map(n => (
                <button key={`real-${n}`} onClick={() => startRealTimeTest(n)} disabled={realTimeTest || manualTracking} style={{padding:'3px 2px',borderRadius:'4px',background: (realTimeTest || manualTracking) ? '#333' : '#2a4a3a',border:'1px solid #4a7a5a',color:'#f5deb3',cursor: (realTimeTest || manualTracking) ? 'not-allowed' : 'pointer',fontSize:'9px'}}>{n}</button>
              ))}
            </div>
            {realTimeTest && (
              <div style={{marginTop:'6px',textAlign:'center'}}>
                <div style={{color:'#4f4',fontSize:'11px',marginBottom:'4px'}}>
                  Auto-spinning: {realTimeProgress}/{realTimeTarget}
                </div>
                <div style={{background:'#333',borderRadius:'4px',height:'8px',overflow:'hidden'}}>
                  <div style={{background:'#4f4',height:'100%',width:`${(realTimeProgress/realTimeTarget)*100}%`,transition:'width 0.3s'}}/>
                </div>
                <button onClick={stopRealTimeTest} style={{marginTop:'6px',padding:'4px 10px',borderRadius:'4px',background:'#6a2a2a',border:'1px solid #a04040',color:'#f5deb3',cursor:'pointer',fontSize:'10px'}}>STOP</button>
              </div>
            )}
          </div>
          
          {/* Results Section */}
          {testResults && (
            <div style={{marginBottom:'10px',paddingBottom:'8px',borderBottom:'1px solid #8B6F47',color:'#f5deb3',fontSize:'10px'}}>
              <div style={{marginBottom:'6px',textAlign:'center'}}>
                <strong style={{color: testResults.type === 'manual' ? '#4af' : testResults.type === 'realtime' ? '#4f4' : '#aaa'}}>
                  {testResults.type === 'manual' ? '👆 MANUAL' : testResults.type === 'realtime' ? '✓ AUTO' : '~ SIM'}
                </strong> {testResults.totalSpins} spins<br/>
                Hit: <span style={{color: testResults.promptsHit === 20 ? '#4f4' : testResults.promptsHit >= 15 ? '#ff4' : '#f44'}}>{testResults.promptsHit}/20</span>
                {' | '}Range: {testResults.minHits}-{testResults.maxHits} | Avg: {testResults.avgHits.toFixed(1)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gap:'2px',fontSize:'9px'}}>
                {testResults.distribution.map(d => (
                  <div key={d.index} style={{
                    padding:'2px',
                    background: d.count === 0 ? '#600' : d.count > testResults.avgHits * 1.5 ? '#660' : '#363',
                    borderRadius:'2px',
                    textAlign:'center'
                  }}>
                    {d.index}:{d.count}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Prompt List with Landing Counts */}
          <div>
            <div style={{color:'#f5deb3',fontSize:'10px',textAlign:'center',marginBottom:'6px',fontWeight:'bold'}}>
              WHEEL PROMPTS {manualLandings.length > 0 && `(${manualLandings.length} spins tracked)`}
            </div>
            <div style={{maxHeight:'300px',overflowY:'auto',fontSize:'9px'}}>
              {prompts.slice(0, 20).map((prompt, idx) => {
                const count = promptLandingCounts[prompt] || 0;
                const isRecent = manualLandings.length > 0 && manualLandings[manualLandings.length - 1] === prompt;
                const hasAnyTracking = Object.keys(promptLandingCounts).length > 0;
                return (
                  <div key={idx} style={{
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center',
                    padding:'3px 6px',
                    marginBottom:'2px',
                    background: isRecent ? 'rgba(74,170,255,0.3)' : count > 0 ? 'rgba(100,150,100,0.2)' : 'rgba(255,255,255,0.05)',
                    borderRadius:'3px',
                    border: isRecent ? '1px solid #4af' : '1px solid transparent'
                  }}>
                    <span style={{color:'#888',marginRight:'6px',minWidth:'18px'}}>{idx}:</span>
                    <span style={{flex:1,color:'#f5deb3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{prompt}</span>
                    {hasAnyTracking && (
                      <span style={{
                        marginLeft:'6px',
                        padding:'1px 6px',
                        borderRadius:'10px',
                        background: count === 0 ? '#444' : count > 2 ? '#a66' : '#6a6',
                        color:'#fff',
                        fontWeight:'bold',
                        minWidth:'20px',
                        textAlign:'center'
                      }}>{count}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}
        
        </div>
      </div>
    );
  }
  
  if (view === 'record') {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:'40px',overflow:'auto',touchAction:'auto'}}>
        <div style={{maxWidth:'600px',width:'100%',background:'rgba(0,0,0,0.8)',padding:'40px',borderRadius:'12px',border:'3px solid #8B6F47'}}>
          <h1 style={{color:'#f5deb3',fontSize:'32px',marginBottom:'24px',textAlign:'center',textShadow:'2px 2px 4px #000'}}>Record Your Story</h1>
          {selectedPromptForRecording && (
            <div style={{background:'rgba(139,69,19,0.3)',padding:'20px',borderRadius:'8px',marginBottom:'32px',border:'2px solid #8B6F47'}}>
              <p style={{color:'#f5deb3',fontSize:'20px',fontWeight:'bold',margin:0,textAlign:'center'}}>{selectedPromptForRecording}</p>
            </div>
          )}
          <p style={{color:'#f5deb3',fontSize:'16px',lineHeight:1.6,textAlign:'center'}}>Recording functionality coming soon...</p>
          <button onClick={() => setView('wheel')} style={{marginTop:'32px',padding:'16px 32px',width:'100%',borderRadius:'8px',fontWeight:'bold',fontSize:'18px',background:'linear-gradient(180deg,#6a5a4a,#2a1a0a)',border:'3px solid #8B6F47',color:'#f5deb3',cursor:'pointer'}}>Back to Wheel</button>
        </div>
      </div>
    );
  }
  
  if (view === 'stories') {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:'40px',overflow:'auto',touchAction:'auto'}}>
        <div style={{maxWidth:'800px',width:'100%',background:'rgba(0,0,0,0.8)',padding:'40px',borderRadius:'12px',border:'3px solid #8B6F47'}}>
          <h1 style={{color:'#f5deb3',fontSize:'32px',marginBottom:'24px',textAlign:'center',textShadow:'2px 2px 4px #000'}}>My Stories</h1>
          <p style={{color:'#f5deb3',fontSize:'16px',lineHeight:1.6,textAlign:'center'}}>Your recorded stories will appear here...</p>
          <button onClick={() => setView('wheel')} style={{marginTop:'32px',padding:'16px 32px',width:'100%',borderRadius:'8px',fontWeight:'bold',fontSize:'18px',background:'linear-gradient(180deg,#6a5a4a,#2a1a0a)',border:'3px solid #8B6F47',color:'#f5deb3',cursor:'pointer'}}>Back to Wheel</button>
        </div>
      </div>
    );
  }
  
  if (view === 'about') {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:'40px',overflow:'auto',touchAction:'auto'}}>
        <div style={{maxWidth:'600px',width:'100%',background:'rgba(0,0,0,0.8)',padding:'40px',borderRadius:'12px',border:'3px solid #8B6F47'}}>
          <h1 style={{color:'#f5deb3',fontSize:'32px',marginBottom:'24px',textAlign:'center',textShadow:'2px 2px 4px #000'}}>About The Story Portal</h1>
          <p style={{color:'#f5deb3',fontSize:'16px',lineHeight:1.6}}>The Story Portal is a Love Burn festival experience where you can spin the wheel, select a prompt, and record your stories to share with the community.</p>
          <button onClick={() => setView('wheel')} style={{marginTop:'32px',padding:'16px 32px',width:'100%',borderRadius:'8px',fontWeight:'bold',fontSize:'18px',background:'linear-gradient(180deg,#6a5a4a,#2a1a0a)',border:'3px solid #8B6F47',color:'#f5deb3',cursor:'pointer'}}>Back to Wheel</button>
        </div>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);