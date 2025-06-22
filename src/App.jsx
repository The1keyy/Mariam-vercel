import { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import './App.css';
import pic from '/pic.jpeg';
import song from '/song.mp3';

function App() {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showExtra, setShowExtra] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVolumeReminder, setShowVolumeReminder] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    
    // Stop confetti after 20 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 20000);

    // Simulate loading time for better UX
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      // Show volume reminder immediately after loading
      setShowVolumeReminder(true);
    }, 1500);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      clearTimeout(loadingTimer);
    };
  }, []);

  // Initialize audio when component mounts
  useEffect(() => {
    if (audioRef.current) {
      // Set audio properties
      audioRef.current.volume = 0.7; // Set volume to 70%
      audioRef.current.preload = 'auto';
      
      // Add event listeners for debugging
      audioRef.current.addEventListener('loadstart', () => console.log('Audio loading started'));
      audioRef.current.addEventListener('canplay', () => console.log('Audio can play'));
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setAudioError('Failed to load audio file');
      });
    }
  }, []);

  const startAudio = async () => {
    if (audioRef.current && !audioStarted) {
      try {
        console.log('Starting audio...');
        await audioRef.current.play();
        console.log('Audio started successfully');
        setAudioStarted(true);
        setIsAudioPlaying(true);
        setShowVolumeReminder(false);
      } catch (error) {
        console.error('Audio play failed:', error);
        // Keep the volume reminder visible if audio fails
        setShowVolumeReminder(true);
      }
    }
  };

  const toggleAudio = async () => {
    if (audioRef.current) {
      try {
        if (isAudioPlaying) {
          audioRef.current.pause();
          setIsAudioPlaying(false);
        } else {
          await audioRef.current.play();
          setIsAudioPlaying(true);
          setAudioStarted(true);
        }
      } catch (error) {
        console.error('Toggle audio failed:', error);
      }
    }
  };

  const handleVolumeDismiss = async () => {
    setShowVolumeReminder(false);
    // Start audio when user clicks "Got it!"
    await startAudio();
  };

  // Enhanced user interaction handling
  useEffect(() => {
    let hasInteracted = false;

    const handleUserInteraction = async () => {
      if (!hasInteracted && !audioStarted) {
        hasInteracted = true;
        console.log('User interaction detected, starting audio...');
        await startAudio();
        
        // Remove all listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('scroll', handleUserInteraction);
        window.removeEventListener('scroll', handleUserInteraction);
      }
    };

    // Try autoplay first
    const tryAutoplay = async () => {
      console.log('Trying autoplay...');
      await startAudio();
    };

    // Small delay to ensure audio element is ready
    const autoplayTimer = setTimeout(tryAutoplay, 500);

    // Add multiple interaction listeners as fallback
    document.addEventListener('click', handleUserInteraction, { passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });
    document.addEventListener('scroll', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      clearTimeout(autoplayTimer);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, [audioStarted]);

  // Better pull-to-refresh prevention that allows scrolling
  useEffect(() => {
    let startY = 0;
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Only prevent if at top and pulling down
      if (scrollTop <= 0 && currentY > startY) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your special message...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {showConfetti && (
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height}
          colors={['#ffb3d9', '#ffcce6', '#ffe6f2', '#fff0f5']}
          recycle={false}
          numberOfPieces={150}
          gravity={0.3}
          wind={0.05}
          friction={0.99}
        />
      )}
      
      {/* Background music */}
      <audio 
        ref={audioRef} 
        loop 
        style={{ display: 'none' }}
        preload="auto"
      >
        <source src={song} type="audio/mpeg" />
        <source src={song} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {/* Volume Reminder - Shows immediately and stays until user clicks "Got it!" */}
      {showVolumeReminder && (
        <div className="volume-reminder">
          <div className="volume-content">
            <span className="volume-icon">🔊</span>
            <p>Turn up your volume for the full experience!</p>
            {audioError && (
              <p style={{ fontSize: '0.9rem', color: '#e53e3e', marginTop: '8px' }}>
                Audio issue: {audioError}
              </p>
            )}
            <button 
              className="volume-dismiss"
              onClick={handleVolumeDismiss}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Audio Control Button */}
      <button 
        className="audio-control"
        onClick={toggleAudio}
        aria-label={isAudioPlaying ? 'Pause music' : 'Play music'}
      >
        {isAudioPlaying ? '🔊' : '🔇'}
      </button>

      <div className="container">
        <div className="content">
          {/* Header */}
          <div className="header animate-fade-in">
            <h1>Mariam</h1>
            <p className="subtitle">Bachelor of Science in Nursing</p>
            <p className="year">2025</p>
          </div>

          {/* Photo */}
          <div className="photo-container animate-fade-in-delay">
            <img
              src={pic}
              alt="Mariam"
              className="photo"
              loading="lazy"
            />
          </div>

          {/* Main Message */}
          <div className="message animate-fade-in-delay-2">
            <p>
{`Congratulations Mariam,

I originally made this little site as a gift to give you at your graduation party. I had planned to share it that day, but something personal came up last minute and I wasn't able to be there.

I know you're probably going to say it's fine — and I appreciate that — but honestly, I really didn't want to miss it. You deserve to be celebrated for everything you've worked for, and I hope you had a great time with the people around you.

I coded this myself as a small way to say congratulations and show love for all that you've accomplished. You've always carried yourself with good energy and stayed lowkey, and I respect that. I wish you nothing but the best as you step into nursing and everything else that's ahead.

Hope this little page makes you smile — even just for a moment.

– Keyshawn
`}
            </p>
          </div>

          {/* Interactive Button */}
          <div className="button-container animate-fade-in-delay-3">
            <button 
              className="extra-btn"
              onClick={() => setShowExtra(true)}
              disabled={showExtra}
              aria-label="Tap for a little extra"
            >
              {showExtra ? '✨' : 'Tap for a little extra'}
            </button>
          </div>

          {/* Extra Message */}
          {showExtra && (
            <div className="extra-message">
              <p>Wishing you peace, fulfillment, and everything that makes you feel like you're exactly where you belong.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
