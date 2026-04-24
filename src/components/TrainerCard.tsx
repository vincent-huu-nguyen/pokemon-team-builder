import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Download, Edit3, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Pokemon } from '../types/Pokemon';
import {
  POKEMON_LIST_PAGE_SIZE,
  parsePokemonNamesFromText,
  fetchPokemonByNameForList,
} from '../utils/pokemonPokeApi';
import './TrainerCard.css';
import { useState } from 'react';
import trainerVincent from '../assets/Trainer_Vincent.png';

interface TrainerCardProps {
  trainerName: string;
  setTrainerName: (name: string) => void;
  selectedPokemon: Pokemon[];
  /** Replaces the full team (used for Pokémon list bulk import, list layout only) */
  replaceSelectedPokemon: (pokemon: Pokemon[]) => void;
  onRemovePokemon: (index: number) => void;
  trainerSprite: string;
  onTrainerSpriteChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  availableSprites: { name: string; src: string }[];
  onSpriteSelect: (sprite: string) => void;
  pokeballImage: string;
  artStyle: 'pixel' | 'official';
  cardColor: string;
  setCardColor: (color: string) => void;
  gradientColor: string;
  setGradientColor: (color: string) => void;
  isGradient: boolean;
  setIsGradient: (value: boolean) => void;
}

function chunkPokemonListForDisplay<T>(items: T[], pageSize: number): T[][] {
  if (items.length === 0) return [];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    out.push(items.slice(i, i + pageSize));
  }
  return out;
}

const TrainerCard: React.FC<TrainerCardProps> = ({
  trainerName,
  setTrainerName,
  selectedPokemon,
  replaceSelectedPokemon,
  onRemovePokemon,
  trainerSprite,
  onTrainerSpriteChange,
  availableSprites,
  onSpriteSelect,
  pokeballImage,
  artStyle,
  cardColor,
  setCardColor,
  gradientColor,
  setGradientColor,
  isGradient,
  setIsGradient,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const selectionBarRef = useRef<HTMLDivElement>(null);
  const listLayoutRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSpriteSelector, setShowSpriteSelector] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'card' | 'party' | 'list'>('card');
  const [pokemonSizes, setPokemonSizes] = useState<{ [key: number]: number }>({});
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [isTrainerSelected, setIsTrainerSelected] = useState(false);
  const [isTrainerNameSelected, setIsTrainerNameSelected] = useState(false);
  const [selectionHistory, setSelectionHistory] = useState<('trainer' | 'trainerName' | number)[]>([]);
  const [pokemonPositions, setPokemonPositions] = useState<{ x: number; y: number }[]>([]);
  const [trainerPosition, setTrainerPosition] = useState({ x: 50, y: 70 });
  const [trainerNamePosition, setTrainerNamePosition] = useState({ x: 50, y: 15 });
  const [trainerNameSize, setTrainerNameSize] = useState(24);
  const [trainerNameColor, setTrainerNameColor] = useState('#ffffff');
  const [trainerNamePixelFont, setTrainerNamePixelFont] = useState(true);
  const [trainerSize, setTrainerSize] = useState(140);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialSize, setInitialSize] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [showBubbles, setShowBubbles] = useState(true);
  const [syncPageBackground, setSyncPageBackground] = useState(true);
  const [showTrainerSprite, setShowTrainerSprite] = useState(true);
  const [showTrainerName, setShowTrainerName] = useState(true);
  const [flippedItems, setFlippedItems] = useState<{ [key: string]: boolean }>({});
  const [rotatedItems, setRotatedItems] = useState<{ [key: string]: number }>({});
  const [listBulkText, setListBulkText] = useState('');
  const [listBulkError, setListBulkError] = useState('');
  const [listBulkLoading, setListBulkLoading] = useState(false);

  const cardSurfaceStyle = useMemo(
    () =>
      ({
        background: backgroundImage
          ? `url(${backgroundImage})`
          : isGradient
            ? `linear-gradient(135deg, ${cardColor} 0%, ${gradientColor} 100%)`
            : cardColor,
        backgroundSize: backgroundImage ? 'cover' : 'auto',
        backgroundPosition: backgroundImage ? 'center' : 'auto',
        backgroundRepeat: backgroundImage ? 'no-repeat' : 'auto',
        '--pokeball-image': `url(${pokeballImage})`,
      }) as React.CSSProperties,
    [backgroundImage, isGradient, cardColor, gradientColor, pokeballImage]
  );

  const applyListBulkFromText = useCallback(async () => {
    setListBulkError('');
    const names = parsePokemonNamesFromText(listBulkText);
    if (names.length === 0) {
      setListBulkError('Enter at least one Pokémon name (comma, newline, or semicolon).');
      return;
    }
    setListBulkLoading(true);
    try {
      const results = await Promise.all(
        names.map(async (name, order) => {
          try {
            const pokemon = await fetchPokemonByNameForList(name);
            return { ok: true as const, order, pokemon, raw: name };
          } catch {
            return { ok: false as const, order, raw: name };
          }
        })
      );
      const failed = results
        .filter((r): r is { ok: false; order: number; raw: string } => !r.ok)
        .map((r) => r.raw);
      const ok = results
        .filter(
          (r): r is { ok: true; order: number; pokemon: Pokemon; raw: string } => r.ok
        )
        .map((r) => r);
      ok.sort((a, b) => {
        const da = a.pokemon.dexNumber ?? a.pokemon.id;
        const db = b.pokemon.dexNumber ?? b.pokemon.id;
        if (da !== db) return da - db;
        return a.order - b.order;
      });
      const sorted = ok.map((x) => x.pokemon);
      setPokemonSizes({});
      setPokemonPositions([]);
      setSelectionHistory([]);
      setSelectedPokemonIndex(null);
      setIsTrainerSelected(false);
      setIsTrainerNameSelected(false);
      replaceSelectedPokemon(sorted);
      if (failed.length > 0) {
        setListBulkError(
          `Could not find: ${Array.from(new Set(failed)).join(', ')}`
        );
      }
    } catch {
      setListBulkError('Something went wrong. Try again in a moment.');
    } finally {
      setListBulkLoading(false);
    }
  }, [listBulkText, replaceSelectedPokemon]);

  // Function to update page background to match card colors
  const updatePageBackground = useCallback(() => {
    const body = document.body;
    if (!syncPageBackground) {
      // Reset to default if sync is disabled
      body.style.background = '';
      body.style.backgroundSize = '';
      body.style.backgroundPosition = '';
      body.style.backgroundRepeat = '';
      body.style.backgroundAttachment = '';
      return;
    }
    
    if (backgroundImage) {
      // If there's a background image, use a subtle overlay
      body.style.background = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundRepeat = 'no-repeat';
      body.style.backgroundAttachment = 'fixed';
    } else if (isGradient) {
      // If gradient is enabled, use the gradient colors
      body.style.background = `linear-gradient(135deg, ${cardColor} 0%, ${gradientColor} 100%)`;
      body.style.backgroundAttachment = 'fixed';
    } else {
      // If solid color, use the primary color
      body.style.background = cardColor;
    }
  }, [syncPageBackground, backgroundImage, isGradient, cardColor, gradientColor]);

  // Update page background whenever colors change
  useEffect(() => {
    updatePageBackground();
    
    // Cleanup function to reset background when component unmounts
    return () => {
      document.body.style.background = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
    };
  }, [cardColor, gradientColor, isGradient, backgroundImage, syncPageBackground, updatePageBackground]);

  // Auto-scroll selection bar when items are selected on the card
  useEffect(() => {
    if (selectionBarRef.current) {
      let itemIndex = -1;
      
      if (isTrainerNameSelected) {
        itemIndex = 0; // Name is first
      } else if (isTrainerSelected) {
        itemIndex = 1; // Trainer is second
      } else if (selectedPokemonIndex !== null) {
        itemIndex = selectedPokemonIndex + 2; // Pokemon start at index 2
      }
      
      if (itemIndex >= 0) {
        const buttonWidth = 50; // Width of each selection button
        const gap = 8; // Gap between buttons (0.5rem = 8px)
        const totalItemWidth = buttonWidth + gap;
        const scrollPosition = itemIndex * totalItemWidth;
        
        // Only scroll if the item is not visible (beyond the first 7 items)
        const visibleWidth = 7 * totalItemWidth;
        if (scrollPosition >= visibleWidth) {
          selectionBarRef.current.scrollTo({
            left: scrollPosition - visibleWidth + totalItemWidth,
            behavior: 'smooth'
          });
        } else if (itemIndex === 0) {
          // Scroll to beginning for first item
          selectionBarRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [selectedPokemonIndex, isTrainerSelected, isTrainerNameSelected]);

  const convertImageToDataURL = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Improve image quality for pixel art sprites
          ctx.imageSmoothingEnabled = false;
          ctx.imageSmoothingQuality = 'high';
          
          // Clear canvas and draw image
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          resolve(canvas.toDataURL('image/png', 1.0));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = () => {
        // Fallback to custom trainer sprite if image fails to load
        resolve(trainerVincent);
      };
      img.src = imageUrl;
    });
  };

  const createHighQualityScaledSprite = async (imageUrl: string, targetSize: number, isOfficialArt: boolean = false): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Create a high-resolution canvas (4x the target size for better quality)
        const highResSize = targetSize * 4;
        const canvas = document.createElement('canvas');
        canvas.width = highResSize;
        canvas.height = highResSize;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Set up rendering based on art type
          if (isOfficialArt) {
            // For official artwork, use smooth scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
          } else {
            // For pixel art, use nearest neighbor to maintain pixelated look
            ctx.imageSmoothingEnabled = false;
          }
          
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Scale up the image to the high-res size
          ctx.drawImage(img, 0, 0, highResSize, highResSize);
          
          // Create final canvas at target size
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = targetSize;
          finalCanvas.height = targetSize;
          const finalCtx = finalCanvas.getContext('2d');
          
          if (finalCtx) {
            // Apply same smoothing settings for final step
            if (isOfficialArt) {
              finalCtx.imageSmoothingEnabled = true;
              finalCtx.imageSmoothingQuality = 'high';
            } else {
              finalCtx.imageSmoothingEnabled = false;
            }
            
            // Draw the high-res image to final size
            finalCtx.drawImage(canvas, 0, 0, targetSize, targetSize);
            
            resolve(finalCanvas.toDataURL('image/png', 1.0));
          } else {
            reject(new Error('Could not get final canvas context'));
          }
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = () => {
        // Fallback to original image if scaling fails
        resolve(imageUrl);
      };
      img.src = imageUrl;
    });
  };



  const downloadCard = async () => {
    if (cardRef.current) {
      setIsDownloading(true);
      try {
        // Create a clone of the card for clean download
        const cardClone = cardRef.current.cloneNode(true) as HTMLElement;
        
        // Remove all interactive elements from the clone
        const elementsToRemove = cardClone.querySelectorAll(
          '.remove-pokemon-btn, .edit-name-btn, .sprite-upload, .sprite-upload-label, .sprite-change-btn, .download-btn, .card-controls'
        );
        elementsToRemove.forEach(el => el.remove());
        
        // Hide any input fields and show the display version
        const nameInputs = cardClone.querySelectorAll('.trainer-name-input');
        nameInputs.forEach(input => {
          const inputElement = input as HTMLInputElement;
          const displayDiv = document.createElement('div');
          displayDiv.className = 'trainer-name-display';
          displayDiv.innerHTML = `<h2>${inputElement.value || trainerName}</h2>`;
          inputElement.parentNode?.replaceChild(displayDiv, inputElement);
        });

        // Ensure trainer name is visible even if not in input field
        const trainerNameDisplays = cardClone.querySelectorAll('.trainer-name-display h2');
        trainerNameDisplays.forEach(h2 => {
          if (!h2.textContent || h2.textContent.trim() === '') {
            h2.textContent = trainerName;
          }
        });

        // Detect if we're on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Force trainer name to be visible on mobile and preserve color
        const trainerNameContainers = cardClone.querySelectorAll('.trainer-name-display');
        trainerNameContainers.forEach(container => {
          const h2 = container.querySelector('h2');
          if (h2) {
            // Preserve the custom color if it's set, otherwise use white
            if (!h2.style.color || h2.style.color === 'white' || h2.style.color === 'rgb(255, 255, 255)') {
              h2.style.color = trainerNameColor;
            }
            h2.style.display = 'block';
            h2.style.visibility = 'visible';
            h2.style.fontSize = '1.75rem';
            h2.style.fontWeight = '700';
            h2.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
            h2.style.margin = '0';
            if (trainerNamePixelFont) {
              h2.style.fontFamily = '"Press Start 2P", cursive';
            }
          }
        });

        // Apply background styling to ensure proper capture on all devices
        const applySurfaceToElement = (el: HTMLElement) => {
          if (backgroundImage) {
            el.style.background = `url(${backgroundImage})`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
            el.style.backgroundRepeat = 'no-repeat';
          } else if (isGradient) {
            el.style.background = `linear-gradient(135deg, ${cardColor} 0%, ${gradientColor} 100%)`;
          } else {
            el.style.background = cardColor;
          }
        };
        if (cardClone.classList.contains('trainer-list-bulk-export')) {
          cardClone.style.background = 'transparent';
          cardClone.querySelectorAll('.trainer-card').forEach((node) => {
            applySurfaceToElement(node as HTMLElement);
          });
        } else {
          applySurfaceToElement(cardClone);
        }
        
        // Temporarily add the clone to the DOM (hidden)
        cardClone.style.position = 'absolute';
        cardClone.style.left = '-9999px';
        cardClone.style.top = '-9999px';
        document.body.appendChild(cardClone);
        
        // Convert all Pokemon images to high-quality scaled versions
        const pokemonImages = cardClone.querySelectorAll('.pokemon-sprite, .party-pokemon-sprite, .pokemon-list-sprite');
        const imagePromises = Array.from(pokemonImages).map(async (img) => {
          const imgElement = img as HTMLImageElement;
          if (imgElement.src && !imgElement.src.startsWith('data:')) {
            try {
              // Determine the target size based on the sprite type and mode
              let targetSize = 60; // Default size
              let displaySize = 60; // Size to display (keep layout intact)
              
              // Check if this is a card mode Pokemon sprite (not party mode)
              const isListSprite = imgElement.classList.contains('pokemon-list-sprite');
              if (imgElement.classList.contains('pokemon-sprite') && !imgElement.classList.contains('party-pokemon-sprite') && !isListSprite) {
                // For card mode, keep display size at 100px but create high-quality 200px version
                displaySize = 100; // Keep the display size to maintain layout
                targetSize = 200; // Create high-quality version at larger size for better clarity
              } else if (isListSprite) {
                // For list mode, use a good quality size; layout is grid-based so don't set dimensions
                targetSize = 160;
              } else {
                // For party mode, use the current size or a minimum
                const currentSize = parseInt(imgElement.style.width) || parseInt(imgElement.style.height) || 60;
                displaySize = currentSize; // Keep the current display size
                targetSize = Math.max(currentSize * 1.5, 120); // Scale up by 1.5x for better clarity
              }
              
              // Create a high-quality scaled version at the target size
              const scaledDataURL = await createHighQualityScaledSprite(imgElement.src, targetSize, artStyle === 'official');
              imgElement.src = scaledDataURL;
              
              // Set the display size to maintain exact layout positioning (list mode keeps CSS 100%)
              if (!isListSprite) {
                imgElement.style.width = `${displaySize}px`;
                imgElement.style.height = `${displaySize}px`;
              }
              
              // Improve image rendering quality
              imgElement.style.imageRendering = 'crisp-edges';
              imgElement.style.imageRendering = '-webkit-optimize-contrast';
              imgElement.style.imageRendering = '-moz-crisp-edges';
            } catch (error) {
              console.error('Error converting image:', error);
            }
          }
        });

        // Wait for all images to be converted
        await Promise.all(imagePromises);



        // Also convert trainer sprite if it's external
        const trainerSpriteImg = cardClone.querySelector('.trainer-sprite') as HTMLImageElement;
        if (trainerSpriteImg && trainerSpriteImg.src && !trainerSpriteImg.src.startsWith('data:')) {
          try {
            const dataURL = await convertImageToDataURL(trainerSpriteImg.src);
            trainerSpriteImg.src = dataURL;
            // Ensure the sprite maintains its aspect ratio
            trainerSpriteImg.style.width = 'auto';
            trainerSpriteImg.style.height = 'auto';
            trainerSpriteImg.style.maxWidth = '140px';
            trainerSpriteImg.style.maxHeight = '140px';
          } catch (error) {
            console.error('Error converting trainer sprite:', error);
          }
        }

        // Wait a bit for the DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(cardClone, {
          backgroundColor: null,
          scale: isMobile ? 2 : 4,
          useCORS: true,
          allowTaint: true,
          imageTimeout: 0,
          logging: false,
          removeContainer: true,
          width: cardClone.offsetWidth,
          height: cardClone.offsetHeight,
          onclone: (clonedDoc) => {
            const root = clonedDoc.querySelector('[data-capture-root]') as HTMLElement | null;
            if (!root) return;
            const isMultilist = root.classList.contains('trainer-list-bulk-export');
            const cardEls: HTMLElement[] = isMultilist
              ? Array.from(root.querySelectorAll('.trainer-card'))
              : [root];
            for (const el of cardEls) {
              if (backgroundImage) {
                el.style.background = `url(${backgroundImage})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.style.backgroundRepeat = 'no-repeat';
              } else if (isGradient) {
                el.style.background = `linear-gradient(135deg, ${cardColor} 0%, ${gradientColor} 100%)`;
              } else {
                el.style.background = cardColor;
              }
            }
          }
        });
        
        // Remove the clone from DOM
        document.body.removeChild(cardClone);
        
        const link = document.createElement('a');
        link.download = `${trainerName}-team.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Error downloading card:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditingName(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, index?: number, type?: 'trainer' | 'trainerName') => {
    setIsDragging(true);
    setDragStartTime(Date.now());
    
    const cardRect = cardRef.current?.getBoundingClientRect();
    if (!cardRect) return;
    
    const mouseX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
    const mouseY = ((e.clientY - cardRect.top) / cardRect.height) * 100;
    
    if (index !== undefined) {
      setSelectedPokemonIndex(index);
      setIsTrainerSelected(false);
      setIsTrainerNameSelected(false);
      const position = pokemonPositions[index] || { x: 20 + (index * 12), y: 70 };
      setDragOffset({ x: mouseX - position.x, y: mouseY - position.y });
    } else if (type === 'trainerName') {
      setSelectedPokemonIndex(null);
      setIsTrainerNameSelected(true);
      setIsTrainerSelected(false);
      setDragOffset({ x: mouseX - trainerNamePosition.x, y: mouseY - trainerNamePosition.y });
    } else if (type === 'trainer') {
      setSelectedPokemonIndex(null);
      setIsTrainerSelected(true);
      setIsTrainerNameSelected(false);
      setDragOffset({ x: mouseX - trainerPosition.x, y: mouseY - trainerPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const cardRect = cardRef.current?.getBoundingClientRect();
    if (!cardRect) return;

    const mouseX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
    const mouseY = ((e.clientY - cardRect.top) / cardRect.height) * 100;

    if (selectedPokemonIndex !== null) {
      const newPositions = [...pokemonPositions];
      newPositions[selectedPokemonIndex] = { 
        x: mouseX - dragOffset.x, 
        y: mouseY - dragOffset.y 
      };
      setPokemonPositions(newPositions);
    } else if (isTrainerNameSelected) {
      setTrainerNamePosition({ 
        x: mouseX - dragOffset.x, 
        y: mouseY - dragOffset.y 
      });
    } else if (isTrainerSelected) {
      setTrainerPosition({ 
        x: mouseX - dragOffset.x, 
        y: mouseY - dragOffset.y 
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Don't clear the selection - keep it for size adjustment
  };

  // Touch event handlers for mobile dragging
  const handleTouchStart = (e: React.TouchEvent, index?: number, type?: 'trainer' | 'trainerName') => {
    e.preventDefault(); // Prevent default touch behavior
    
    // Don't change selection if this is a pinch gesture (2 touches)
    if (e.touches.length === 2) {
      return;
    }
    
    setIsDragging(true);
    
    const cardRect = cardRef.current?.getBoundingClientRect();
    if (!cardRect) return;
    
    const touch = e.touches[0];
    const touchX = ((touch.clientX - cardRect.left) / cardRect.width) * 100;
    const touchY = ((touch.clientY - cardRect.top) / cardRect.height) * 100;
    
    if (index !== undefined) {
      setSelectedPokemonIndex(index);
      setIsTrainerSelected(false);
      setIsTrainerNameSelected(false);
      const position = pokemonPositions[index] || { x: 20 + (index * 12), y: 70 };
      setDragOffset({ x: touchX - position.x, y: touchY - position.y });
    } else if (type === 'trainerName') {
      setSelectedPokemonIndex(null);
      setIsTrainerNameSelected(true);
      setIsTrainerSelected(false);
      setDragOffset({ x: touchX - trainerNamePosition.x, y: touchY - trainerNamePosition.y });
    } else if (type === 'trainer') {
      setSelectedPokemonIndex(null);
      setIsTrainerSelected(true);
      setIsTrainerNameSelected(false);
      setDragOffset({ x: touchX - trainerPosition.x, y: touchY - trainerPosition.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while dragging
    
    // Handle pinch gestures for resizing - only if something is selected
    if (e.touches.length === 2 && initialPinchDistance > 0 && (selectedPokemonIndex !== null || isTrainerSelected || isTrainerNameSelected)) {
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newSize = Math.max(40, Math.min(500, initialSize * scale));
      
      if (selectedPokemonIndex !== null) {
        setPokemonSizes(prev => ({
          ...prev,
          [selectedPokemonIndex]: Math.round(newSize)
        }));
      } else if (isTrainerSelected) {
        setTrainerSize(Math.round(newSize));
      } else if (isTrainerNameSelected) {
        setTrainerNameSize(Math.round(newSize));
      }
      return;
    }
    
    // Handle single touch dragging
    if (!isDragging) return;
    
    const cardRect = cardRef.current?.getBoundingClientRect();
    if (!cardRect) return;

    const touch = e.touches[0];
    const touchX = ((touch.clientX - cardRect.left) / cardRect.width) * 100;
    const touchY = ((touch.clientY - cardRect.top) / cardRect.height) * 100;

    if (selectedPokemonIndex !== null) {
      const newPositions = [...pokemonPositions];
      newPositions[selectedPokemonIndex] = { 
        x: touchX - dragOffset.x, 
        y: touchY - dragOffset.y 
      };
      setPokemonPositions(newPositions);
    } else if (isTrainerNameSelected) {
      setTrainerNamePosition({ 
        x: touchX - dragOffset.x, 
        y: touchY - dragOffset.y 
      });
    } else if (isTrainerSelected) {
      setTrainerPosition({ 
        x: touchX - dragOffset.x, 
        y: touchY - dragOffset.y 
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Reset pinch state
    setInitialPinchDistance(0);
    setInitialSize(0);
    // Don't clear the selection - keep it for size adjustment
  };

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePokemonClick = (index: number) => {
    // Don't handle click if we were dragging
    if (isDragging && Date.now() - dragStartTime > 100) {
      return;
    }
    
    // Select this Pokemon (last clicked sprite stays selected; deselect by clicking empty space on card)
    setSelectedPokemonIndex(index);
    setIsTrainerSelected(false);
    setIsTrainerNameSelected(false);
    // Always move the selected item to the front of z-index layers
    setSelectionHistory(prev => [...prev.filter(item => item !== index), index]);
  };

  const handleTrainerClick = () => {
    // Don't handle click if we were dragging
    if (isDragging && Date.now() - dragStartTime > 100) {
      return;
    }
    
    // Select the trainer (last clicked stays selected; deselect by clicking empty space on card)
    setSelectedPokemonIndex(null);
    setIsTrainerSelected(true);
    setIsTrainerNameSelected(false);
    // Always move the selected item to the front of z-index layers
    setSelectionHistory(prev => [...prev.filter(item => item !== 'trainer'), 'trainer']);
  };

  const handleTrainerNameClick = () => {
    // Don't handle click if we were dragging
    if (isDragging && Date.now() - dragStartTime > 100) {
      return;
    }
    
    // Select the trainer name (last clicked stays selected; deselect by clicking empty space on card)
    setSelectedPokemonIndex(null);
    setIsTrainerNameSelected(true);
    setIsTrainerSelected(false);
    // Always move the selected item to the front of z-index layers
    setSelectionHistory(prev => [...prev.filter(item => item !== 'trainerName'), 'trainerName']);
  };

  const getZIndex = (item: 'trainer' | 'trainerName' | number): number => {
    const itemIndex = selectionHistory.indexOf(item);
    
    if (itemIndex === -1) {
      // Item not in selection history, give it base z-index
      return 1;
    }
    
    // Most recent selection (last in array) gets highest z-index
    // Older selections get progressively lower z-index
    // The last item in selection history (most recent) should be at the front
    return itemIndex + 1;
  };

  const handleBackgroundImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFlipItem = () => {
    if (selectedPokemonIndex !== null) {
      const itemKey = `pokemon-${selectedPokemonIndex}`;
      setFlippedItems(prev => ({
        ...prev,
        [itemKey]: !prev[itemKey]
      }));
    } else if (isTrainerSelected) {
      setFlippedItems(prev => ({
        ...prev,
        'trainer': !prev['trainer']
      }));
    } else if (isTrainerNameSelected) {
      setFlippedItems(prev => ({
        ...prev,
        'trainerName': !prev['trainerName']
      }));
    }
  };

  const handleRotateItem = (direction: 'clockwise' | 'counterclockwise') => {
    if (selectedPokemonIndex !== null) {
      const itemKey = `pokemon-${selectedPokemonIndex}`;
      const currentRotation = rotatedItems[itemKey] || 0;
      const newRotation = direction === 'clockwise' 
        ? currentRotation + 10 
        : currentRotation - 10;
      setRotatedItems(prev => ({
        ...prev,
        [itemKey]: newRotation
      }));
    } else if (isTrainerSelected) {
      const currentRotation = rotatedItems['trainer'] || 0;
      const newRotation = direction === 'clockwise' 
        ? currentRotation + 10 
        : currentRotation - 10;
      setRotatedItems(prev => ({
        ...prev,
        'trainer': newRotation
      }));
    } else if (isTrainerNameSelected) {
      const currentRotation = rotatedItems['trainerName'] || 0;
      const newRotation = direction === 'clockwise' 
        ? currentRotation + 10 
        : currentRotation - 10;
      setRotatedItems(prev => ({
        ...prev,
        'trainerName': newRotation
      }));
    }
  };

  const handleRemovePokemon = (index: number) => {
    // Clean up size data for the removed Pokemon
    setPokemonSizes(prev => {
      const newSizes = { ...prev };
      delete newSizes[index];
      // Shift down sizes for Pokemon after the removed one
      const shiftedSizes: { [key: number]: number } = {};
      Object.keys(newSizes).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          shiftedSizes[oldIndex - 1] = newSizes[oldIndex];
        } else {
          shiftedSizes[oldIndex] = newSizes[oldIndex];
        }
      });
      return shiftedSizes;
    });
    
    // Clean up position data for the removed Pokemon
    setPokemonPositions(prev => {
      const newPositions = [...prev];
      newPositions.splice(index, 1);
      return newPositions;
    });
    
    // Remove the Pokemon
    onRemovePokemon(index);
    
    // Clean up selection history for the removed Pokemon
    setSelectionHistory(prev => prev.filter(item => item !== index));
    
    // Clear selection if the removed Pokemon was selected
    if (selectedPokemonIndex === index) {
      setSelectedPokemonIndex(null);
      setIsTrainerSelected(false);
    } else if (selectedPokemonIndex !== null && selectedPokemonIndex > index) {
      // Adjust selection index if a Pokemon before the selected one was removed
      setSelectedPokemonIndex(selectedPokemonIndex - 1);
    }
  };

  return (
    <div className="trainer-card-container">
      <div className="card-controls">
        <div className="layout-controls">
          <div className="layout-toggle">
            <label>
              <input
                type="radio"
                name="layout"
                value="card"
                checked={layoutMode === 'card'}
                onChange={(e) => setLayoutMode(e.target.value as 'card' | 'party' | 'list')}
              />
              Trainer Card
            </label>
            <label>
              <input
                type="radio"
                name="layout"
                value="party"
                checked={layoutMode === 'party'}
                onChange={(e) => setLayoutMode(e.target.value as 'card' | 'party' | 'list')}
              />
              Trainer Party
            </label>
            <label>
              <input
                type="radio"
                name="layout"
                value="list"
                checked={layoutMode === 'list'}
                onChange={(e) => setLayoutMode(e.target.value as 'card' | 'party' | 'list')}
              />
              Pokemon List
            </label>
          </div>
        </div>
        
        {/* Trainer Controls - Outside the card */}
        <div className="trainer-controls">
          <div className="trainer-name-edit">
            {isEditingName ? (
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                onKeyDown={handleNameSave}
                onBlur={() => setIsEditingName(false)}
                className="trainer-name-input"
                autoFocus
                placeholder="Type your trainer name here..."
              />
            ) : (
              <div className="trainer-name-display">
                <span>{trainerName || 'Name'}</span>
                <button onClick={handleNameEdit} className="edit-name-btn">
                  <Edit3 size={14} />
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowSpriteSelector(true)}
            className="sprite-change-btn"
          >
            Change Sprite
          </button>
        </div>

      </div>
      
      {layoutMode === 'list' ? (
        <>
          <div
            ref={cardRef}
            className="trainer-list-bulk-export"
            data-capture-root
          >
            {selectedPokemon.length === 0 ? (
              <div
                className={`trainer-card list-mode ${showBubbles ? 'show-bubbles' : 'no-bubbles'}`}
                style={cardSurfaceStyle}
              >
                <div className="pokemon-list-layout" ref={listLayoutRef}>
                  <div className="pokemon-list-empty">
                    <p>
                      Select Pokémon from the selector, or use the text area below to paste names
                      (comma, newline, or semicolon), then apply.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              chunkPokemonListForDisplay(
                selectedPokemon,
                POKEMON_LIST_PAGE_SIZE
              ).map((chunk, chunkIndex) => (
                <div
                  key={chunkIndex}
                  className={`trainer-card list-mode ${showBubbles ? 'show-bubbles' : 'no-bubbles'}`}
                  style={cardSurfaceStyle}
                >
                  <div
                    className="pokemon-list-layout"
                    ref={chunkIndex === 0 ? listLayoutRef : undefined}
                  >
                    <div
                      className="pokemon-list"
                      style={{
                        gridTemplateRows: `repeat(${Math.ceil(chunk.length / 2)}, minmax(0, 1fr))`,
                      }}
                    >
                      {chunk.map((pokemon, localIndex) => {
                        const globalIndex =
                          chunkIndex * POKEMON_LIST_PAGE_SIZE + localIndex;
                        return (
                          <div
                            key={`${globalIndex}-${pokemon.id}-${pokemon.name}`}
                            className="pokemon-list-item"
                            onClick={() => handleRemovePokemon(globalIndex)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && handleRemovePokemon(globalIndex)
                            }
                            aria-label={`Remove ${pokemon.name} from list`}
                          >
                            <div className="pokemon-list-sprite-wrap">
                              <img
                                src={
                                  artStyle === 'official'
                                    ? pokemon.officialArtwork || pokemon.image
                                    : pokemon.image
                                }
                                alt={pokemon.name}
                                className={`pokemon-list-sprite ${
                                  artStyle === 'official' ? 'official-art' : 'pixel-art'
                                }`}
                              />
                            </div>
                            <p
                              className="pokemon-list-name"
                              style={{
                                color: trainerNameColor,
                                textAlign: 'left',
                                ...(trainerNamePixelFont && {
                                  fontFamily: '"Press Start 2P", cursive',
                                }),
                              }}
                            >
                              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pokemon-list-bulk-panel">
            <label className="pokemon-list-bulk-label" htmlFor="pokemon-list-bulk-text">
              Paste or type Pokémon names (separate with commas, new lines, or semicolons). They
              are applied in National Pokédex order.
            </label>
            <textarea
              id="pokemon-list-bulk-text"
              className="pokemon-list-bulk-textarea"
              value={listBulkText}
              onChange={(e) => {
                setListBulkText(e.target.value);
                setListBulkError('');
              }}
              rows={4}
              placeholder="e.g. pikachu, charizard, mew, snorlax"
              disabled={listBulkLoading}
            />
            <button
              type="button"
              className="pokemon-list-bulk-apply"
              onClick={applyListBulkFromText}
              disabled={listBulkLoading}
            >
              {listBulkLoading ? 'Loading…' : 'Apply & sort by Pokédex'}
            </button>
            {listBulkError ? (
              <p className="pokemon-list-bulk-error" role="alert">
                {listBulkError}
              </p>
            ) : null}
          </div>
        </>
      ) : (
      <div
        ref={cardRef}
        data-capture-root
        className={`trainer-card ${layoutMode === 'party' ? 'party-mode' : ''} ${
          showBubbles ? 'show-bubbles' : 'no-bubbles'
        }`}
        style={cardSurfaceStyle}
      >
        {layoutMode === 'card' ? (
          <>
            <div className="card-header">
              <div className="trainer-info">
                <div className="trainer-sprite-container">
                  <div className="sprite-wrapper">
                    <img 
                      src={trainerSprite} 
                      alt="Trainer" 
                      className="trainer-sprite"
                      onError={(e) => {
                        e.currentTarget.src = trainerVincent;
                      }}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onTrainerSpriteChange}
                    className="sprite-upload"
                    id="sprite-upload"
                  />
                </div>
                <div className="trainer-name-container">
                  <div className="trainer-name-display">
                    <h2 style={{
                      color: trainerNameColor,
                      ...(trainerNamePixelFont && { fontFamily: '"Press Start 2P", cursive' })
                    }}>{trainerName}</h2>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pokemon-team">
              <div className="pokemon-grid">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="pokemon-slot">
                    {selectedPokemon[index] ? (
                      <div 
                        className="pokemon-item clickable"
                        onClick={() => handleRemovePokemon(index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img 
                          src={artStyle === 'official' ? (selectedPokemon[index].officialArtwork || selectedPokemon[index].image) : selectedPokemon[index].image} 
                          alt={selectedPokemon[index].name}
                          className={`pokemon-sprite ${artStyle === 'official' ? 'official-art' : 'pixel-art'}`}
                        />
                        <p className="pokemon-name">{selectedPokemon[index].name}</p>
                      </div>
                    ) : (
                      <div className="empty-slot">
                        <span></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div 
            className="party-layout"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchStart={(e) => {
              // Handle pinch gestures for resizing - only if something is selected
              if (e.touches.length === 2 && (selectedPokemonIndex !== null || isTrainerSelected || isTrainerNameSelected)) {
                const distance = getTouchDistance(e.touches);
                setInitialPinchDistance(distance);
                
                // Set initial size based on what's currently selected
                if (selectedPokemonIndex !== null) {
                  setInitialSize(pokemonSizes[selectedPokemonIndex] || 60);
                } else if (isTrainerSelected) {
                  setInitialSize(trainerSize);
                } else if (isTrainerNameSelected) {
                  setInitialSize(trainerNameSize);
                }
              }
            }}
            onClick={(e) => {
              // Only unselect if clicking directly on the party layout (empty space)
              if (e.target === e.currentTarget) {
                setSelectedPokemonIndex(null);
                setIsTrainerSelected(false);
                setIsTrainerNameSelected(false);
                // Don't clear lastSelectedItem - keep it for z-index
              }
            }}
          >
            {/* Draggable Trainer Name */}
            {showTrainerName && (
              <div 
                className={`draggable-trainer-name ${isTrainerNameSelected ? 'selected' : ''}`}
                style={{
                  left: `${trainerNamePosition.x}%`,
                  top: `${trainerNamePosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: getZIndex('trainerName')
                }}
                onMouseDown={(e) => handleMouseDown(e, undefined, 'trainerName')}
                onTouchStart={(e) => handleTouchStart(e, undefined, 'trainerName')}
                onClick={handleTrainerNameClick}
              >
                <div className="trainer-name-display">
                  <h2 
                    style={{ 
                      fontSize: `${trainerNameSize}px`,
                      color: trainerNameColor,
                      transform: `${flippedItems['trainerName'] ? 'scaleX(-1)' : ''} ${rotatedItems['trainerName'] ? `rotate(${rotatedItems['trainerName']}deg)` : ''}`.trim(),
                      ...(trainerNamePixelFont && { fontFamily: '"Press Start 2P", cursive' })
                    }}
                  >
                    {trainerName}
                  </h2>
                </div>
              </div>
            )}

            {/* Draggable Trainer Sprite Only */}
            {showTrainerSprite && (
              <div 
                className={`draggable-trainer ${isTrainerSelected ? 'selected' : ''}`}
                style={{
                  left: `${trainerPosition.x}%`,
                  top: `${trainerPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: getZIndex('trainer')
                }}
                onMouseDown={(e) => handleMouseDown(e, undefined, 'trainer')}
                onTouchStart={(e) => handleTouchStart(e, undefined, 'trainer')}
                onClick={handleTrainerClick}
              >
                <div className="trainer-sprite-container">
                  <div className="sprite-wrapper">
                    <img 
                      src={trainerSprite} 
                      alt="Trainer" 
                      className="trainer-sprite"
                      style={{ 
                        width: trainerSize, 
                        height: trainerSize,
                        transform: `${flippedItems['trainer'] ? 'scaleX(-1)' : ''} ${rotatedItems['trainer'] ? `rotate(${rotatedItems['trainer']}deg)` : ''}`.trim()
                      }}
                      onError={(e) => {
                        e.currentTarget.src = trainerVincent;
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Draggable Pokemon */}
            {selectedPokemon.map((pokemon, index) => {
              const position = pokemonPositions[index] || { x: 20 + (index * 12), y: 70 };
              const isSelected = selectedPokemonIndex === index;
              const currentSize = pokemonSizes[index] || 60;
              
              return (
                <div 
                  key={index}
                  className={`draggable-pokemon ${isSelected ? 'selected' : ''}`}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: getZIndex(index)
                  }}
                  onMouseDown={(e) => handleMouseDown(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onClick={() => handlePokemonClick(index)}
                >
                                    <img 
                    src={artStyle === 'official' ? (pokemon.officialArtwork || pokemon.image) : pokemon.image} 
                    alt={pokemon.name}
                    className={`party-pokemon-sprite ${artStyle === 'official' ? 'official-art' : 'pixel-art'}`}
                    style={{ 
                      width: currentSize, 
                      height: currentSize,
                      cursor: 'grab',
                      transform: `${flippedItems[`pokemon-${index}`] ? 'scaleX(-1)' : ''} ${rotatedItems[`pokemon-${index}`] ? `rotate(${rotatedItems[`pokemon-${index}`]}deg)` : ''}`.trim()
                    }}
                  />
                  {selectedPokemonIndex === index && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePokemon(index);
                      }}
                      className="remove-pokemon-btn"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
            
          </div>
        )}

      </div>
      )}
      
      {/* Selection Bar - Quick select buttons */}
      {layoutMode === 'party' && (
        <div className="selection-bar" ref={selectionBarRef}>
          <button 
            className={`selection-btn ${isTrainerNameSelected ? 'selected' : ''} ${!showTrainerName ? 'hidden-item' : ''}`}
            onClick={handleTrainerNameClick}
          >
            <span className="trainer-name-btn">Name</span>
          </button>
          <button 
            className={`selection-btn ${isTrainerSelected ? 'selected' : ''} ${!showTrainerSprite ? 'hidden-item' : ''}`}
            onClick={handleTrainerClick}
          >
            <img 
              src={trainerSprite} 
              alt="Trainer"
              className="selection-btn-sprite"
              onError={(e) => {
                e.currentTarget.src = trainerVincent;
              }}
            />
          </button>
          {Array.from({ length: 6 }, (_, index) => (
            <button 
              key={index}
              className={`selection-btn ${selectedPokemonIndex === index ? 'selected' : ''}`}
              onClick={() => handlePokemonClick(index)}
            >
              {selectedPokemon[index] ? (
                <img 
                  src={artStyle === 'official' ? (selectedPokemon[index].officialArtwork || selectedPokemon[index].image) : selectedPokemon[index].image} 
                  alt={selectedPokemon[index].name}
                  className={`selection-btn-sprite ${artStyle === 'official' ? 'official-art' : 'pixel-art'}`}
                />
              ) : (
                <span className="empty-slot-indicator">+</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Selection Bar Hint */}
      {layoutMode === 'party' && (
        <div className="selection-bar-hint">
          <p>
            💡 <strong>Tip:</strong> Click items to select and drag them. Adjust size, flip, and rotate when selected. Most recent selection appears on top.
          </p>
        </div>
      )}
      
      {/* Size Controls - Positioned under selection bar in party mode */}
      {layoutMode === 'party' && selectedPokemonIndex !== null && (
        <div className="size-control-container">
          <div className="size-control">
            <label>
              Pokemon {selectedPokemonIndex + 1} Size: {pokemonSizes[selectedPokemonIndex] || 60}px
            </label>
            <input
              type="range"
              min="40"
              max="500"
              value={pokemonSizes[selectedPokemonIndex] || 60}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPokemonSizes(prev => ({
                  ...prev,
                  [selectedPokemonIndex]: newSize
                }));
              }}
            />
            <p className="size-hint">
              Click on a Pokemon to adjust its size
            </p>
          </div>
          <div className="transform-controls">
            <button 
              onClick={handleFlipItem}
              className="flip-btn"
              title="Flip Pokemon"
            >
              🔄 Flip
            </button>
            <button 
              onClick={() => handleRotateItem('counterclockwise')}
              className="rotate-btn"
              title="Rotate Counter-clockwise"
            >
              ↶ Rotate Left
            </button>
            <button 
              onClick={() => handleRotateItem('clockwise')}
              className="rotate-btn"
              title="Rotate Clockwise"
            >
              ↷ Rotate Right
            </button>
          </div>
        </div>
      )}
      
      {/* Trainer Size Control - Only show when trainer is selected and visible */}
      {layoutMode === 'party' && isTrainerSelected && (
        <div className="size-control-container">
          <div className="size-control">
            <div className="visibility-toggle">
              <input
                type="checkbox"
                id="trainer-sprite-toggle"
                checked={showTrainerSprite}
                onChange={(e) => setShowTrainerSprite(e.target.checked)}
              />
              <label htmlFor="trainer-sprite-toggle">Show Trainer Sprite</label>
            </div>
            {showTrainerSprite && (
              <>
                <label>
                  Trainer Size: {trainerSize}px
                </label>
                <input
                  type="range"
                  min="40"
                  max="500"
                  value={trainerSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setTrainerSize(newSize);
                  }}
                />
                <p className="size-hint">
                  Click on the trainer to adjust its size
                </p>
              </>
            )}
          </div>
          {showTrainerSprite && (
            <div className="transform-controls">
              <button 
                onClick={handleFlipItem}
                className="flip-btn"
                title="Flip Trainer"
              >
                🔄 Flip
              </button>
              <button 
                onClick={() => handleRotateItem('counterclockwise')}
                className="rotate-btn"
                title="Rotate Counter-clockwise"
              >
                ↶ Rotate Left
              </button>
              <button 
                onClick={() => handleRotateItem('clockwise')}
                className="rotate-btn"
                title="Rotate Clockwise"
              >
                ↷ Rotate Right
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Trainer Name Size Control - Only show when trainer name is selected and visible */}
      {layoutMode === 'party' && isTrainerNameSelected && (
        <div className="size-control-container">
          <div className="size-control">
            <div className="visibility-toggle">
              <input
                type="checkbox"
                id="trainer-name-toggle"
                checked={showTrainerName}
                onChange={(e) => setShowTrainerName(e.target.checked)}
              />
              <label htmlFor="trainer-name-toggle">Show Trainer Name</label>
            </div>
            {showTrainerName && (
              <>
                <label>
                  Trainer Name Size: {trainerNameSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={trainerNameSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setTrainerNameSize(newSize);
                  }}
                />
                <p className="size-hint">
                  Click on the trainer name to adjust its size
                </p>
              </>
            )}
          </div>
          {showTrainerName && (
            <div className="transform-controls">
              <button 
                onClick={handleFlipItem}
                className="flip-btn"
                title="Flip Trainer Name"
              >
                🔄 Flip
              </button>
              <button 
                onClick={() => handleRotateItem('counterclockwise')}
                className="rotate-btn"
                title="Rotate Counter-clockwise"
              >
                ↶ Rotate Left
              </button>
              <button 
                onClick={() => handleRotateItem('clockwise')}
                className="rotate-btn"
                title="Rotate Clockwise"
              >
                ↷ Rotate Right
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="card-customization">
        <div className="customization-header">
          <h4>Card Customization</h4>
                  <div className="customization-toggles">
          <div className="gradient-toggle">
            <input
              type="checkbox"
              id="gradient-toggle"
              checked={isGradient}
              onChange={(e) => setIsGradient(e.target.checked)}
            />
            <label htmlFor="gradient-toggle">Gradient</label>
          </div>
          <div className="bubbles-toggle">
            <input
              type="checkbox"
              id="bubbles-toggle"
              checked={showBubbles}
              onChange={(e) => setShowBubbles(e.target.checked)}
            />
            <label htmlFor="bubbles-toggle">Bubbles</label>
          </div>
          <div className="background-sync-toggle">
            <input
              type="checkbox"
              id="background-sync-toggle"
              checked={syncPageBackground}
              onChange={(e) => setSyncPageBackground(e.target.checked)}
            />
            <label htmlFor="background-sync-toggle">Sync Page Background</label>
          </div>
        </div>
        </div>
        
        <div className="color-controls">
          <div className="color-picker">
            <label>Primary Color:</label>
            <input
              type="color"
              value={cardColor}
              onChange={(e) => setCardColor(e.target.value)}
              className="color-input"
            />
          </div>
          
          {isGradient && (
            <div className="color-picker">
              <label>Secondary Color:</label>
              <input
                type="color"
                value={gradientColor}
                onChange={(e) => setGradientColor(e.target.value)}
                className="color-input"
              />
            </div>
          )}
          
          <div className="color-picker">
            <label>Text Color:</label>
            <input
              type="color"
              value={trainerNameColor}
              onChange={(e) => setTrainerNameColor(e.target.value)}
              className="color-input"
            />
          </div>
          <div className="pixel-font-toggle">
            <input
              type="checkbox"
              id="pixel-font-toggle"
              checked={trainerNamePixelFont}
              onChange={(e) => setTrainerNamePixelFont(e.target.checked)}
            />
            <label htmlFor="pixel-font-toggle">Pixel font (name)</label>
          </div>
        </div>
        
        <div className="background-controls">
          <div className="background-upload">
            <label>Background Image:</label>
            <div className="background-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageChange}
                className="background-upload-input"
                id="background-upload"
              />
              <label htmlFor="background-upload" className="background-upload-label">
                {backgroundImage ? 'Change Background' : 'Upload Background'}
              </label>
              {backgroundImage && (
                <button 
                  onClick={() => setBackgroundImage('')}
                  className="remove-background-btn"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <button onClick={downloadCard} className="download-btn" disabled={isDownloading}>
        <Download size={16} />
        {isDownloading ? 'Processing...' : 'Download Card'}
      </button>
      
      {/* Sprite Selector Modal */}
      {showSpriteSelector && (
        <div className="sprite-selector-overlay" onClick={() => setShowSpriteSelector(false)}>
          <div className="sprite-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sprite-selector-header">
              <h3>Choose Your Trainer Sprite</h3>
              <button 
                onClick={() => setShowSpriteSelector(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="sprite-grid">
              {availableSprites.map((sprite, index) => (
                <div 
                  key={index}
                  className={`sprite-option ${trainerSprite === sprite.src ? 'selected' : ''}`}
                  onClick={() => {
                    onSpriteSelect(sprite.src);
                    setShowSpriteSelector(false);
                  }}
                >
                  <img src={sprite.src} alt={sprite.name} />
                </div>
              ))}
              
              {/* Custom Upload Option */}
              <div className="sprite-option custom-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        onSpriteSelect(event.target?.result as string);
                        setShowSpriteSelector(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  id="custom-sprite-upload"
                />
                <label htmlFor="custom-sprite-upload">
                  <div className="upload-icon">+</div>
                  <span>Upload Custom</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerCard;
