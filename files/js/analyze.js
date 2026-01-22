/**
 * OFF SCRIPT - Text Analysis Module
 * Combines statistical analysis with optional AI detection API
 */

// Statistical analysis (always runs, no API needed)
function analyzeText(text) {
    const sentences = getSentences(text);
    const words = getWords(text);
    
    // Calculate statistical metrics
    const diversity = calculateLexicalDiversity(words);
    const variance = calculateSentenceVariance(sentences);
    const burstiness = calculateBurstiness(sentences);
    
    // Calculate AI-like patterns (statistical)
    const aiPatterns = detectAIPatterns(text, sentences);
    
    // Combine into flatness score
    const flatness = calculateFlatness(diversity, variance, burstiness, aiPatterns);
    
    // Per-sentence scores
    const sentenceScores = sentences.map(s => 
        calculateSentenceDiversity(s)
    );
    
    return {
        text: text,
        flatness: flatness,
        diversity: diversity,
        variance: variance,
        burstiness: burstiness,
        aiPatterns: aiPatterns,
        sentenceScores: sentenceScores,
        sentenceCount: sentences.length,
        wordCount: words.length,
        apiDetection: null // Will be filled if API is called
    };
}

// Optional: Call AI detection API
async function enhanceWithAPI(text, analysis) {
    // Try Hugging Face (no API key needed)
    const apiResult = await detectAIWithHuggingFace(text);
    
    if (apiResult) {
        analysis.apiDetection = apiResult;
        
        // Adjust flatness based on API result (weighted average)
        // 70% statistical, 30% API
        const apiInfluencedFlatness = Math.round(
            (analysis.flatness * 0.7) + (apiResult.aiProbability * 100 * 0.3)
        );
        
        analysis.flatnessWithAPI = apiInfluencedFlatness;
    }
    
    return analysis;
}

// Hugging Face AI Detection
async function detectAIWithHuggingFace(text) {
    // Truncate if too long (API limit)
    const truncatedText = text.slice(0, 5000);
    
    const API_URL = "https://api-inference.huggingface.co/models/roberta-base-openai-detector";
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                inputs: truncatedText,
                options: { wait_for_model: true }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle model loading
        if (result.error && result.error.includes('loading')) {
            console.log('Model loading, will retry...');
            // Could implement retry logic here
            return null;
        }
        
        // Find "Fake" (AI-generated) score
        const fakeResult = Array.isArray(result) ? result[0] : result;
        const fakeScore = fakeResult.find(r => r.label === "Fake")?.score || 0;
        
        return {
            aiProbability: fakeScore,
            source: 'huggingface',
            model: 'roberta-base-openai-detector'
        };
    } catch (error) {
        console.error('Hugging Face API error:', error);
        return null;
    }
}

// Detect AI patterns (statistical) - ENHANCED
function detectAIPatterns(text, sentences) {
    let score = 0;
    const patterns = [];
    
    // 1. Check for AI-specific phrases (weighted higher)
    const aiPhrases = [
        { pattern: /\bdelve\b/i, weight: 15, name: "delve" },
        { pattern: /it'?s important to note/i, weight: 12, name: "important to note" },
        { pattern: /it'?s worth mentioning/i, weight: 12, name: "worth mentioning" },
        { pattern: /in today'?s/i, weight: 8, name: "in today's" },
        { pattern: /\bleverage\b/i, weight: 10, name: "leverage" },
        { pattern: /\butilize\b/i, weight: 10, name: "utilize" },
        { pattern: /\bfacilitate\b/i, weight: 10, name: "facilitate" },
        { pattern: /\bmoreover\b/i, weight: 7, name: "moreover" },
        { pattern: /\bfurthermore\b/i, weight: 7, name: "furthermore" },
        { pattern: /\badditionally\b/i, weight: 7, name: "additionally" },
        { pattern: /\bsubsequently\b/i, weight: 8, name: "subsequently" },
        { pattern: /\bcomprehensive\b/i, weight: 6, name: "comprehensive" },
        { pattern: /\boptimize\b/i, weight: 8, name: "optimize" },
        { pattern: /\bstakeholder/i, weight: 9, name: "stakeholder" },
        { pattern: /\bsynergy\b/i, weight: 10, name: "synergy" },
        { pattern: /\bparadigm\b/i, weight: 9, name: "paradigm" },
        { pattern: /in conclusion/i, weight: 8, name: "in conclusion" },
        { pattern: /to summarize/i, weight: 8, name: "to summarize" }
    ];
    
    aiPhrases.forEach(item => {
        const matches = text.match(new RegExp(item.pattern, 'gi'));
        if (matches) {
            score += matches.length * item.weight;
            patterns.push(`Found "${item.name}" ${matches.length}x`);
        }
    });
    
    // 2. Check for uniform sentence length (stronger penalty)
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const stdDev = calculateStdDev(lengths);
    if (stdDev < 6) {
        score += 25;
        patterns.push('Very uniform sentence length');
    } else if (stdDev < 8) {
        score += 15;
        patterns.push('Somewhat uniform sentences');
    }
    
    // 3. Check for lack of contractions (stronger)
    const contractions = text.match(/n't|'ll|'re|'ve|'d|'m|'s/g);
    const wordCount = text.split(/\s+/).length;
    const contractionRatio = contractions ? contractions.length / wordCount : 0;
    
    if (contractionRatio < 0.01 && wordCount > 50) {
        score += 20;
        patterns.push('Almost no contractions');
    } else if (contractionRatio < 0.03 && wordCount > 50) {
        score += 10;
        patterns.push('Few contractions');
    }
    
    // 4. Check for passive voice
    const passiveMatches = text.match(/\b(?:is|are|was|were|be|been|being)\s+\w+ed\b/gi);
    if (passiveMatches && passiveMatches.length > sentences.length * 0.3) {
        score += 15;
        patterns.push('High passive voice usage');
    }
    
    // 5. Check for formal transitions
    const formalTransitions = text.match(/\b(?:however|therefore|thus|hence|consequently|accordingly)\b/gi);
    if (formalTransitions && formalTransitions.length > 3) {
        score += 12;
        patterns.push('Formal transition words');
    }
    
    // 6. Long average sentence length
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    if (avgLength > 25) {
        score += 15;
        patterns.push('Very long sentences');
    } else if (avgLength > 20) {
        score += 8;
        patterns.push('Long sentences');
    }
    
    // 7. Lack of personality markers
    const personalityMarkers = text.match(/\b(?:I|my|me|you|really|just|actually|literally|honestly|basically)\b/gi);
    const personalityRatio = personalityMarkers ? personalityMarkers.length / wordCount : 0;
    
    if (personalityRatio < 0.02 && wordCount > 50) {
        score += 18;
        patterns.push('Lacks personal voice');
    }
    
    return {
        score: Math.min(score, 100),
        patterns: patterns
    };
}

function calculateFlatness(diversity, variance, burstiness, aiPatterns) {
    // Normalize metrics with better calibration
    const diversityScore = 1 - Math.min(diversity / 0.6, 1); // Lower threshold
    const varianceScore = 1 - Math.min(variance / 8, 1); // Lower threshold
    const burstinessScore = 1 - Math.min(burstiness / 0.25, 1); // Lower threshold
    const patternScore = aiPatterns.score / 100;
    
    // Weighted combination - pattern detection has more weight
    const flatness = (
        diversityScore * 0.25 +
        varianceScore * 0.2 +
        burstinessScore * 0.2 +
        patternScore * 0.35
    ) * 100;
    
    return Math.round(flatness);
}

// Helper functions
function getSentences(text) {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

function getWords(text) {
    return text
        .toLowerCase()
        .match(/\b\w+\b/g) || [];
}

function calculateLexicalDiversity(words) {
    if (words.length === 0) return 0;
    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length;
}

function calculateSentenceVariance(sentences) {
    if (sentences.length === 0) return 0;
    const lengths = sentences.map(s => s.split(/\s+/).length);
    return calculateStdDev(lengths);
}

function calculateBurstiness(sentences) {
    if (sentences.length === 0) return 0;
    
    const complexities = sentences.map(s => {
        const words = s.split(/\s+/);
        return words.reduce((sum, w) => sum + w.length, 0) / (words.length || 1);
    });
    
    const mean = complexities.reduce((a, b) => a + b, 0) / complexities.length;
    const stdDev = calculateStdDev(complexities);
    
    return stdDev / (mean || 1);
}

function calculateStdDev(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => 
        sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
}

function calculateSentenceDiversity(sentence) {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length === 0) return 0.5; // Default neutral
    
    const uniqueWords = new Set(words);
    const localDiversity = uniqueWords.size / words.length;
    
    const avgWordLength = words.reduce((sum, w) => 
        sum + w.length, 0) / words.length;
    
    // Check for AI markers - ONLY truly AI-specific phrase combinations
    const aiMarkers = [
        /\bit'?s important to note\b/i,
        /\bit'?s worth mentioning\b/i,
        /\bin today'?s (rapidly evolving|digital|modern)\b/i,
        /\bleverage\b.*\b(synerg|opportunit)/i,
        /\bstakeholder(s)?\b.*\b(engag|align|priorit)/i,
        /\bcomprehensive (understanding|approach|strategy|framework)\b/i,
        /\boptimize\b.*\b(workflow|process|performance|operational)\b/i,
        /\b(moreover|furthermore|additionally),\b.*\b(facilitate|enable|enhance)\b/i,
        /\bdata-driven decision(s|-making)?\b/i,
        /\bevidence-based approach(es)?\b/i,
        /\bcompetitive advantage\b/i,
        /\bdigital transformation (initiative|effort|journey)\b/i,
        /\bcross-functional (team|collaboration)\b/i,
        /\bkey performance indicator(s)?\b/i,
        /\bemerging trend(s)?\b.*\b(capitalize|identify)\b/i,
        /\borganizational culture\b.*\b(change management|transformation)\b/i,
        /\bcontinuous learning\b.*\b(innovation|environment)\b/i,
        /\bsubsequently,\b.*\b(foster|enable|facilitate)\b/i,
        /\bparamount\b.*\b(organizational success|achievement)\b/i,
        /\bsynerg(y|ies)\b/i,
        /\bparadigm shift\b/i,
        /\bdelve into\b/i
    ];
    
    let aiPenalty = 0;
    aiMarkers.forEach(marker => {
        if (marker.test(sentence)) aiPenalty += 0.25; // Strong penalty for true AI phrases
    });
    
    // STRUCTURAL AI DETECTION - patterns in sentence construction
    
    // 1. Excessive length (AI loves run-on sentences)
    if (words.length > 100) {
        aiPenalty += 0.4; // Very long sentence
    } else if (words.length > 60) {
        aiPenalty += 0.25; // Long sentence
    } else if (words.length > 40) {
        aiPenalty += 0.15; // Somewhat long
    }
    
    // 2. Excessive use of qualifiers/hedging
    const hedgingWords = sentence.match(/\b(increasingly|arguably|essentially|fundamentally|notably|particularly|specifically|generally|typically|largely|primarily|ultimately|ostensibly|curiously|strategically|cautiously|broadly|perpetually|endlessly|continuously|remarkably)\b/gi);
    if (hedgingWords && hedgingWords.length > 5) {
        aiPenalty += 0.3;
    } else if (hedgingWords && hedgingWords.length > 3) {
        aiPenalty += 0.2;
    }
    
    // 3. Multiple subordinate clauses (comma overuse)
    const commaCount = (sentence.match(/,/g) || []).length;
    if (commaCount > 12) {
        aiPenalty += 0.3;
    } else if (commaCount > 8) {
        aiPenalty += 0.2;
    } else if (commaCount > 5) {
        aiPenalty += 0.1;
    }
    
    // 4. Abstract noun stacking
    const abstractPatterns = sentence.match(/\b(optimization|synthesis|abstraction|coherence|equilibrium|causality|variance|specificity|familiarity|consistency|capability|efficiency|probability|prediction|recognition|computation)\b/gi);
    if (abstractPatterns && abstractPatterns.length > 4) {
        aiPenalty += 0.25;
    } else if (abstractPatterns && abstractPatterns.length > 2) {
        aiPenalty += 0.15;
    }
    
    // 5. Recursive/meta-commentary patterns
    if (/\b(itself|themselves|self-referential|meta-)\b/gi.test(sentence)) {
        const recursiveCount = (sentence.match(/\b(itself|themselves|self-referential|meta-)\b/gi) || []).length;
        if (recursiveCount > 2) aiPenalty += 0.2;
    }
    
    // 6. Gerund overuse (-ing verbs used as nouns)
    const gerunds = sentence.match(/\b\w+ing\b/g) || [];
    const gerundRatio = gerunds.length / words.length;
    if (gerundRatio > 0.15) {
        aiPenalty += 0.2;
    } else if (gerundRatio > 0.1) {
        aiPenalty += 0.1;
    }
    
    // Check for human markers
    const humanMarkers = [
        /\b(?:I|my|me|you|really|just|actually|literally|honestly|basically|yeah|kinda|sorta)\b/i,
        /[!?]{1,}/,
        /n't|'ll|'re|'ve|'d|'m/
    ];
    
    let humanBonus = 0;
    humanMarkers.forEach(marker => {
        if (marker.test(sentence)) humanBonus += 0.15;
    });
    
    // Base score from diversity and word length (increased weight for neutral text)
    let score = (localDiversity * 0.7) + ((Math.min(avgWordLength, 8) / 10) * 0.3);
    
    // Apply modifiers (reduced AI penalty impact)
    score += humanBonus;
    score -= (aiPenalty * 0.8); // Reduce AI penalty impact to 80%
    
    // Ensure range is 0-1
    return Math.max(0, Math.min(1, score));
}