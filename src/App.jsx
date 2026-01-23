import { useState, useEffect, useCallback } from 'react'
import { Preferences } from '@capacitor/preferences'
import { LocalNotifications } from '@capacitor/local-notifications'
import './App.css'
import happyKoala from './assets/happy_aquakoala.png'
import thirstyKoala from './assets/thirsty_aquakoala.png'
import partyKoala from './assets/party_aquakoala.png'

const KOALA_IMAGES = {
    happy: happyKoala,
    thirsty: thirstyKoala,
    party: partyKoala
}

function App() {
    const [waterAmount, setWaterAmount] = useState(0)
    const [goal, setGoal] = useState(2000)
    const [koalaState, setKoalaState] = useState('happy') // happy, thirsty, party
    const [celebrating, setCelebrating] = useState(false)
    const [history, setHistory] = useState([])
    const [remindersEnabled, setRemindersEnabled] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    const progress = Math.min((waterAmount / goal) * 100, 100)

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            const { value: storedWater } = await Preferences.get({ key: 'waterAmount' })
            const { value: storedGoal } = await Preferences.get({ key: 'goal' })
            const { value: storedHistory } = await Preferences.get({ key: 'history' })
            const { value: lastUpdate } = await Preferences.get({ key: 'lastUpdate' })
            const { value: storedReminders } = await Preferences.get({ key: 'remindersEnabled' })

            const today = new Date().toDateString()

            if (storedGoal) setGoal(parseInt(storedGoal))
            if (storedHistory) setHistory(JSON.parse(storedHistory))
            if (storedReminders) setRemindersEnabled(storedReminders === 'true')

            if (lastUpdate === today) {
                if (storedWater) setWaterAmount(parseInt(storedWater))
            } else {
                // New day! Add previous day to history if it exists
                if (lastUpdate && storedWater) {
                    const newEntry = { date: lastUpdate, amount: parseInt(storedWater), goal: parseInt(storedGoal || 2000) }
                    const updatedHistory = [newEntry, ...JSON.parse(storedHistory || '[]')].slice(0, 7)
                    setHistory(updatedHistory)
                    await Preferences.set({ key: 'history', value: JSON.stringify(updatedHistory) })
                }
                setWaterAmount(0)
                await Preferences.set({ key: 'waterAmount', value: '0' })
                await Preferences.set({ key: 'lastUpdate', value: today })
            }
            setIsLoaded(true)
        }
        loadData()
    }, [])

    // Save data when it changes
    useEffect(() => {
        if (!isLoaded) return
        const saveData = async () => {
            await Preferences.set({ key: 'waterAmount', value: waterAmount.toString() })
            await Preferences.set({ key: 'goal', value: goal.toString() })
            await Preferences.set({ key: 'remindersEnabled', value: remindersEnabled.toString() })
        }
        saveData()
    }, [waterAmount, goal, remindersEnabled, isLoaded])

    const scheduleNotifications = useCallback(async () => {
        // Cancel existing
        await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }] })

        if (remindersEnabled) {
            const permission = await LocalNotifications.requestPermissions()
            if (permission.display === 'granted') {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "Time to hydrate! 🐨",
                            body: "Your friend needs some water. Take a sip!",
                            id: 1,
                            schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 2), repeats: true }, // Every 2 hours
                            sound: null,
                            attachments: null,
                            actionTypeId: "",
                            extra: null
                        }
                    ]
                })
            } else {
                setRemindersEnabled(false)
            }
        }
    }, [remindersEnabled])

    useEffect(() => {
        if (isLoaded) scheduleNotifications()
    }, [remindersEnabled, isLoaded, scheduleNotifications])

    useEffect(() => {
        if (progress >= 100) {
            setKoalaState('party')
            setCelebrating(true)
            const timer = setTimeout(() => setCelebrating(false), 5000)
            return () => clearTimeout(timer)
        } else if (progress < 30) {
            setKoalaState('thirsty')
            setCelebrating(false)
        } else {
            setKoalaState('happy')
            setCelebrating(false)
        }
    }, [progress])

    const addWater = (amount) => {
        setWaterAmount((prev) => prev + amount)
    }

    const resetWater = () => {
        if (window.confirm('Reset today\'s progress?')) {
            setWaterAmount(0)
            setCelebrating(false)
        }
    }

    if (!isLoaded) return <div className="loading">Loading AquaKoala...</div>

    return (
        <div className="app-container">
            {celebrating && <div className="celebration"></div>}

            <header>
                <h1>AquaKoala</h1>
                <p>Stay hydrated with your buddy!</p>
            </header>

            <main>
                <div className="koala-display">
                    <img
                        src={KOALA_IMAGES[koalaState]}
                        alt={`A ${koalaState} Koala`}
                        className="koala-img"
                    />
                </div>

                <div className="progress-section">
                    <div className="tank-container">
                        <div
                            className="liquid"
                            style={{ height: `${progress}%` }}
                        >
                            <div className="water-wave"></div>
                        </div>
                    </div>
                    <p className="stats-text">
                        {waterAmount}ml / {goal}ml ({Math.round(progress)}%)
                    </p>
                </div>

                <div className="controls">
                    <button className="water-btn" onClick={() => addWater(250)}>
                        +250ml
                    </button>
                    <button className="water-btn" onClick={() => addWater(500)}>
                        +500ml
                    </button>
                    <button className="reset-btn" onClick={resetWater}>
                        Reset Day
                    </button>
                </div>

                <div className="history-section">
                    <h3>Last 7 Days</h3>
                    {history.length > 0 ? (
                        <div className="history-list">
                            {history.map((entry, i) => (
                                <div key={i} className="history-item">
                                    <span>{entry.date.split(' ').slice(0, 3).join(' ')}</span>
                                    <span>{entry.amount}ml / {entry.goal}ml</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-history">
                            <p>No history yet. Your daily progress will start appearing here tomorrow! 📈</p>
                        </div>
                    )}
                </div>
            </main>

            <footer>
                <div className="settings-grid">
                    <div className="setting-item">
                        <label>Daily Goal</label>
                        <select value={goal} onChange={(e) => setGoal(parseInt(e.target.value))}>
                            <option value="1500">1500ml</option>
                            <option value="2000">2000ml</option>
                            <option value="2500">2500ml</option>
                            <option value="3000">3000ml</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>Reminders</label>
                        <button
                            className={`toggle-btn ${remindersEnabled ? 'active' : ''}`}
                            onClick={() => setRemindersEnabled(!remindersEnabled)}
                        >
                            {remindersEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
                <p>Keep going, you're doing great!</p>
            </footer>
        </div>
    )
}

export default App

