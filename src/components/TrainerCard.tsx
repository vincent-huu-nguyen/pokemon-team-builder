import React, { useRef } from 'react';
import { Download, Edit3, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Pokemon } from '../types/Pokemon';
import './TrainerCard.css';
import { useState } from 'react';
import trainerVincent from '../assets/Trainer_Vincent.png';

interface TrainerCardProps {
  trainerName: string;
  setTrainerName: (name: string) => void;
  selectedPokemon: Pokemon[];
  onRemovePokemon: (index: number) => void;
  trainerSprite: string;
  onTrainerSpriteChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  availableSprites: { name: string; src: string }[];
  onSpriteSelect: (sprite: string) => void;
  pokeballImage: string;
}

const TrainerCard: React.FC<TrainerCardProps> = ({
  trainerName,
  setTrainerName,
  selectedPokemon,
  onRemovePokemon,
  trainerSprite,
  onTrainerSpriteChange,
  availableSprites,
  onSpriteSelect,
  pokeballImage,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cardColor, setCardColor] = useState('#667eea');
  const [gradientColor, setGradientColor] = useState('#764ba2');
  const [isGradient, setIsGradient] = useState(true);
  const [showSpriteSelector, setShowSpriteSelector] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'card' | 'party'>('card');
  const [pokemonSizes, setPokemonSizes] = useState<{ [key: number]: number }>({});
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [isTrainerSelected, setIsTrainerSelected] = useState(false);
  const [lastSelectedItem, setLastSelectedItem] = useState<'trainer' | number | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<('trainer' | number)[]>([]);
  const [pokemonPositions, setPokemonPositions] = useState<{ x: number; y: number }[]>([]);
  const [trainerPosition, setTrainerPosition] = useState({ x: 50, y: 70 });
  const [trainerSize, setTrainerSize] = useState(140);
  const [isDragging, setIsDragging] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

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

  const createHighQualityScaledSprite = async (imageUrl: string, targetSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Create a high-resolution canvas (8x the target size for maximum sharpness)
        const highResSize = targetSize * 8;
        const canvas = document.createElement('canvas');
        canvas.width = highResSize;
        canvas.height = highResSize;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Set up high-quality rendering with nearest neighbor for pixel art
          ctx.imageSmoothingEnabled = false;
          
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Scale up the image to the high-res size using nearest neighbor
          ctx.drawImage(img, 0, 0, highResSize, highResSize);
          
          // Create intermediate canvas at 2x target size for better quality
          const intermediateCanvas = document.createElement('canvas');
          intermediateCanvas.width = targetSize * 2;
          intermediateCanvas.height = targetSize * 2;
          const intermediateCtx = intermediateCanvas.getContext('2d');
          
          if (intermediateCtx) {
            // Use nearest neighbor for intermediate step
            intermediateCtx.imageSmoothingEnabled = false;
            intermediateCtx.drawImage(canvas, 0, 0, targetSize * 2, targetSize * 2);
            
            // Create final canvas at target size
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = targetSize;
            finalCanvas.height = targetSize;
            const finalCtx = finalCanvas.getContext('2d');
            
            if (finalCtx) {
              // Use nearest neighbor for final step to maintain sharpness
              finalCtx.imageSmoothingEnabled = false;
              
              // Draw the intermediate image to final size
              finalCtx.drawImage(intermediateCanvas, 0, 0, targetSize, targetSize);
              
              resolve(finalCanvas.toDataURL('image/png', 1.0));
            } else {
              reject(new Error('Could not get final canvas context'));
            }
          } else {
            reject(new Error('Could not get intermediate canvas context'));
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

        // Force trainer name to be visible on mobile
        const trainerNameContainers = cardClone.querySelectorAll('.trainer-name-display');
        trainerNameContainers.forEach(container => {
          const h2 = container.querySelector('h2');
          if (h2) {
            h2.style.color = 'white';
            h2.style.display = 'block';
            h2.style.visibility = 'visible';
            h2.style.fontSize = '1.75rem';
            h2.style.fontWeight = '700';
            h2.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
            h2.style.margin = '0';
          }
        });

        // Apply background styling to ensure proper capture on all devices
        if (backgroundImage) {
          cardClone.style.background = `url(${backgroundImage})`;
          cardClone.style.backgroundSize = 'cover';
          cardClone.style.backgroundPosition = 'center';
          cardClone.style.backgroundRepeat = 'no-repeat';
        } else if (isGradient) {
          cardClone.style.background = `linear-gradient(135deg, ${cardColor} 0%, ${gradientColor} 100%)`;
        } else {
          cardClone.style.background = cardColor;
        }
        
        // Temporarily add the clone to the DOM (hidden)
        cardClone.style.position = 'absolute';
        cardClone.style.left = '-9999px';
        cardClone.style.top = '-9999px';
        document.body.appendChild(cardClone);
        
        // Convert all Pokemon images to high-quality scaled versions
        const pokemonImages = cardClone.querySelectorAll('.pokemon-sprite, .party-pokemon-sprite');
        const imagePromises = Array.from(pokemonImages).map(async (img) => {
          const imgElement = img as HTMLImageElement;
          if (imgElement.src && !imgElement.src.startsWith('data:')) {
            try {
              // Determine the target size based on the sprite type and mode
              let targetSize = 60; // Default size
              let displaySize = 60; // Size to display (keep layout intact)
              
              // Check if this is a card mode Pokemon sprite (not party mode)
              if (imgElement.classList.contains('pokemon-sprite') && !imgElement.classList.contains('party-pokemon-sprite')) {
                // For card mode, keep display size at 80px but create high-quality 160px version
                displaySize = 80; // Keep the display size to maintain layout
                targetSize = 160; // Create high-quality version at larger size for better clarity
              } else {
                // For party mode, use the current size or a minimum
                const currentSize = parseInt(imgElement.style.width) || parseInt(imgElement.style.height) || 60;
                displaySize = currentSize; // Keep the current display size
                targetSize = Math.max(currentSize * 1.5, 120); // Scale up by 1.5x for better clarity
              }
              
              // Create a high-quality scaled version at the target size
              const scaledDataURL = await createHighQualityScaledSprite(imgElement.src, targetSize);
              imgElement.src = scaledDataURL;
              
              // Set the display size to maintain exact layout positioning
              imgElement.style.width = `${displaySize}px`;
              imgElement.style.height = `${displaySize}px`;
              
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

        // Get the actual background from the card
        const cardStyle = window.getComputedStyle(cardClone);
        const cardBackground = cardStyle.background || cardStyle.backgroundColor;
        
        // Determine background color for html2canvas
        let backgroundColor = null;
        if (isMobile) {
          // On mobile, use the actual card background if it's a solid color
          if (backgroundImage) {
            // If there's a background image, use a fallback color
            backgroundColor = cardColor || '#667eea';
          } else if (isGradient) {
            // For gradients, try to use the computed background, otherwise use gradient color
            if (cardBackground && cardBackground !== 'rgba(0, 0, 0, 0)' && !cardBackground.includes('gradient')) {
              backgroundColor = cardBackground;
            } else {
              backgroundColor = gradientColor || cardColor || '#667eea';
            }
          } else {
            // For solid colors, use the actual card color
            backgroundColor = cardColor || '#667eea';
          }
        }
        
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
            // Ensure the cloned element has the correct background
            const clonedCard = clonedDoc.querySelector('.trainer-card') as HTMLElement;
            if (clonedCard) {
              if (backgroundImage) {
                clonedCard.style.background = `url(${backgroundImage})`;
                clonedCard.style.backgroundSize = 'cover';
                clonedCard.style.backgroundPosition = 'center';
                clonedCard.style.backgroundRepeat = 'no-repeat';
              } else if (isGradient) {
                clonedCard.style.background = `linear-gradient(135deg, ${cardColor} 0%, ${gradientColor} 100%)`;
              } else {
                clonedCard.style.background = cardColor;
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

  const handleMouseDown = (e: React.MouseEvent, index?: number) => {
    setIsDragging(true);
    if (index !== undefined) {
      setSelectedPokemonIndex(index);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const cardRect = cardRef.current?.getBoundingClientRect();
    if (!cardRect) return;

    const x = ((e.clientX - cardRect.left) / cardRect.width) * 100;
    const y = ((e.clientY - cardRect.top) / cardRect.height) * 100;

    if (selectedPokemonIndex !== null) {
      const newPositions = [...pokemonPositions];
      newPositions[selectedPokemonIndex] = { x, y };
      setPokemonPositions(newPositions);
    } else {
      setTrainerPosition({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Don't clear the selection - keep it for size adjustment
  };

  const handlePokemonClick = (index: number) => {
    // Toggle selection: if already selected, deselect it
    if (selectedPokemonIndex === index) {
      setSelectedPokemonIndex(null);
      setIsTrainerSelected(false);
      setLastSelectedItem(null);
      // Don't remove from selection history - keep z-index layers unchanged
    } else {
      setSelectedPokemonIndex(index);
      setIsTrainerSelected(false);
      setLastSelectedItem(index);
      // Always move the selected item to the front of z-index layers
      setSelectionHistory(prev => [...prev.filter(item => item !== index), index]);
    }
  };

  const handleTrainerClick = () => {
    // Toggle selection: if already selected, deselect it
    if (isTrainerSelected) {
      setSelectedPokemonIndex(null);
      setIsTrainerSelected(false);
      setLastSelectedItem(null);
      // Don't remove from selection history - keep z-index layers unchanged
    } else {
      setSelectedPokemonIndex(null);
      setIsTrainerSelected(true);
      setLastSelectedItem('trainer');
      // Always move the selected item to the front of z-index layers
      setSelectionHistory(prev => [...prev.filter(item => item !== 'trainer'), 'trainer']);
    }
  };

  const getZIndex = (item: 'trainer' | number): number => {
    const totalItems = selectedPokemon.length + 1; // +1 for trainer
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
                onChange={(e) => setLayoutMode(e.target.value as 'card' | 'party')}
              />
              Trainer Card
            </label>
            <label>
              <input
                type="radio"
                name="layout"
                value="party"
                checked={layoutMode === 'party'}
                onChange={(e) => setLayoutMode(e.target.value as 'card' | 'party')}
              />
              Trainer Party
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
                placeholder="Enter trainer name"
              />
            ) : (
              <div className="trainer-name-display">
                <span>{trainerName}</span>
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

        <button onClick={downloadCard} className="download-btn" disabled={isDownloading}>
          <Download size={16} />
          {isDownloading ? 'Processing...' : 'Download Card'}
        </button>
      </div>
      
      <div 
        ref={cardRef} 
        className={`trainer-card ${layoutMode === 'party' ? 'party-mode' : ''}`}
        style={{
          background: backgroundImage 
            ? `url(${backgroundImage})`
            : isGradient 
              ? `linear-gradient(135deg, ${cardColor} 0%, ${gradientColor} 100%)`
              : cardColor,
          backgroundSize: backgroundImage ? 'cover' : 'auto',
          backgroundPosition: backgroundImage ? 'center' : 'auto',
          backgroundRepeat: backgroundImage ? 'no-repeat' : 'auto',
          '--pokeball-image': `url(${pokeballImage})`
        } as React.CSSProperties}
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
                    <h2>{trainerName}</h2>
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
                          src={selectedPokemon[index].image} 
                          alt={selectedPokemon[index].name}
                          className="pokemon-sprite"
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
            onClick={(e) => {
              // Only unselect if clicking directly on the party layout (empty space)
              if (e.target === e.currentTarget) {
                setSelectedPokemonIndex(null);
                setIsTrainerSelected(false);
                // Don't clear lastSelectedItem - keep it for z-index
              }
            }}
          >
            {/* Party Header - Fixed at top */}
            <div className="party-header">
              <div className="trainer-name-container">
                <div className="trainer-name-display">
                  <h2>{trainerName}</h2>
                </div>
              </div>
            </div>

            {/* Draggable Trainer Sprite Only */}
            <div 
              className={`draggable-trainer ${isTrainerSelected ? 'selected' : ''}`}
              style={{
                left: `${trainerPosition.x}%`,
                top: `${trainerPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: getZIndex('trainer')
              }}
              onMouseDown={(e) => handleMouseDown(e)}
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
                      height: trainerSize 
                    }}
                    onError={(e) => {
                      e.currentTarget.src = trainerVincent;
                    }}
                  />
                </div>
              </div>
            </div>
            
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
                  onClick={() => handlePokemonClick(index)}
                >
                                    <img 
                    src={pokemon.image} 
                    alt={pokemon.name}
                    className="party-pokemon-sprite"
                    style={{ 
                      width: currentSize, 
                      height: currentSize,
                      cursor: 'grab'
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
      
      {/* Selection Bar - Quick select buttons */}
      {layoutMode === 'party' && (
        <div className="selection-bar">
          <button 
            className={`selection-btn ${isTrainerSelected ? 'selected' : ''}`}
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
                  src={selectedPokemon[index].image} 
                  alt={selectedPokemon[index].name}
                  className="selection-btn-sprite"
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
            💡 <strong>Selection Bar Tips:</strong> Click any item to select it and adjust its size. 
            Click the same item again to deselect it. The most recently selected item appears on top!
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
              max="300"
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
        </div>
      )}
      
      {/* Trainer Size Control - Only show when trainer is selected */}
      {layoutMode === 'party' && isTrainerSelected && (
        <div className="size-control-container">
          <div className="size-control">
            <label>
              Trainer Size: {trainerSize}px
            </label>
            <input
              type="range"
              min="40"
              max="300"
              value={trainerSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setTrainerSize(newSize);
              }}
            />
            <p className="size-hint">
              Click on the trainer to adjust its size
            </p>
          </div>
        </div>
      )}
      
      <div className="card-customization">
        <div className="customization-header">
          <h4>Card Customization</h4>
          <div className="gradient-toggle">
            <input
              type="checkbox"
              id="gradient-toggle"
              checked={isGradient}
              onChange={(e) => setIsGradient(e.target.checked)}
            />
            <label htmlFor="gradient-toggle">Gradient</label>
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
                  <span>{sprite.name}</span>
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
