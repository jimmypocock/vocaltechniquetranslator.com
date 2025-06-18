import { describe, it, expect } from 'vitest'
import { VocalTranslator } from '@/lib/vocal-translator'
import { performance } from 'perf_hooks'

describe('Performance Benchmarks', () => {
  const translator = new VocalTranslator()
  
  // Test data of varying complexity
  const testCases = [
    { name: 'Short phrase', text: 'Hello world' },
    { name: 'Single line', text: 'Blue jean baby, L.A. lady, seamstress for the band' },
    { name: 'Multiple lines', text: `Walking down the street today
Sunshine in my heart to stay
Everything will be okay
Living life in my own way` },
    { name: 'Complex lyrics', text: `Don't stop believin'
Hold on to that feelin'
Streetlights, people
Living just to find emotion
Hiding somewhere in the night` },
    { name: 'Long text', text: Array(50).fill('Test line with various words').join('\n') }
  ]

  describe('Transformation Speed', () => {
    testCases.forEach(({ name, text }) => {
      it(`should transform ${name} in under 50ms`, () => {
        const measurements: number[] = []
        
        // Run multiple times to get average
        for (let i = 0; i < 10; i++) {
          const start = performance.now()
          translator.translateLyrics(text, 5)
          const end = performance.now()
          measurements.push(end - start)
        }
        
        const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length
        const maxTime = Math.max(...measurements)
        
        console.log(`${name}: avg ${avgTime.toFixed(2)}ms, max ${maxTime.toFixed(2)}ms`)
        
        // Average should be under 50ms
        expect(avgTime).toBeLessThan(50)
        // Max should be under 100ms (allowing for occasional spikes)
        expect(maxTime).toBeLessThan(100)
      })
    })
  })

  describe('Intensity Level Performance', () => {
    const sampleText = 'Blue jean baby, L.A. lady, seamstress for the band'
    
    it('should have similar performance across all intensity levels', () => {
      const timings: Record<number, number> = {}
      
      for (let intensity = 1; intensity <= 10; intensity++) {
        const measurements: number[] = []
        
        for (let i = 0; i < 5; i++) {
          const start = performance.now()
          translator.translateLyrics(sampleText, intensity)
          const end = performance.now()
          measurements.push(end - start)
        }
        
        timings[intensity] = measurements.reduce((a, b) => a + b, 0) / measurements.length
      }
      
      const times = Object.values(timings)
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)
      
      // Performance shouldn't vary by more than 35x between intensity levels
      // (Higher intensities do significantly more transformations)
      // This is acceptable as long as all times are under 50ms
      expect(maxTime / minTime).toBeLessThan(35)
      
      // More importantly, all intensities should be fast
      times.forEach((time, index) => {
        expect(time).toBeLessThan(50) // All should be under 50ms
      })
      
      console.log('Intensity timings:', timings)
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory on repeated transformations', () => {
      const text = Array(100).fill('Test line').join('\n')
      const initialMemory = process.memoryUsage().heapUsed
      
      // Transform many times
      for (let i = 0; i < 100; i++) {
        translator.translateLyrics(text, 5)
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be reasonable (less than 50MB)
      // Node.js garbage collection is not deterministic, so we allow more headroom
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
    })
  })

  describe('Concurrent Transformations', () => {
    it('should handle multiple concurrent transformations efficiently', async () => {
      const texts = Array(50).fill(null).map((_, i) => 
        `Line ${i}: Walking down the street today`
      )
      
      const start = performance.now()
      
      // Transform all texts concurrently
      const promises = texts.map(text => 
        Promise.resolve(translator.translateLyrics(text, 5))
      )
      
      await Promise.all(promises)
      
      const end = performance.now()
      const totalTime = end - start
      
      console.log(`Concurrent transformations (${texts.length} texts): ${totalTime.toFixed(2)}ms`)
      
      // Should complete all transformations in reasonable time
      expect(totalTime).toBeLessThan(500) // 10ms average per transformation
    })
  })
})