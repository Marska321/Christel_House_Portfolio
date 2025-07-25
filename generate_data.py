import pandas as pd
import numpy as np
import random
import json

# --- Configuration ---
NUM_LEARNERS = 250
GRADES = [4, 5, 6, 7]
SUBJECTS = ['English', 'Maths', 'Science', 'Life Skills', 'Afrikaans']
TERMS = [1, 2, 3]

# --- Mock Teacher Notes Phrases ---
POSITIVE_NOTES = ['Shows strong improvement.', 'Engages well in class.', 'Excellent grasp of concepts.', 'A pleasure to teach.', 'Works well with peers.']
NEEDS_SUPPORT_NOTES = ['Struggles with core concepts.', 'Needs encouragement to participate.', 'Easily distracted.', 'Often submits work late.', 'Attendance is a concern.']
NEUTRAL_NOTES = ['Quiet but consistent.', 'Completes all assigned work.', 'Steady progress.', 'Benefits from one-on-one attention.']

# --- Data Generation Logic ---
learner_data = []

for i in range(1, NUM_LEARNERS + 1):
    learner_id = f'CH-L{2025-random.choice(GRADES)}{i:03d}' # e.g., CH-L2021001 for a Grade 4
    grade = random.choice(GRADES)
    
    # Assign flags
    socio_economic_indicator = random.choices(['High', 'Medium', 'Low'], weights=[0.1, 0.4, 0.5], k=1)[0]
    learning_barrier_flag = np.random.choice([True, False], p=[0.15, 0.85]) # 15% have a barrier

    # Create a baseline academic profile for the learner
    base_avg = np.random.normal(loc=70, scale=10)
    # Learners with barriers or low SEI might have a lower baseline
    if learning_barrier_flag:
        base_avg -= 10
    if socio_economic_indicator == 'Low':
        base_avg -= 5
        
    # Generate data for each subject and term
    for subject in SUBJECTS:
        # Give some subjects a natural boost/dip for realism
        subject_offset = np.random.normal(loc=0, scale=5)
        
        for term in TERMS:
            # Simulate slight progress or dip over terms
            term_trend = (term - 1) * np.random.choice([-1.5, 0.5, 2.5]) # slight dip, steady, or growth
            
            # Generate attendance - slightly correlated with performance
            attendance_perc = max(50, min(100, np.random.normal(loc=92, scale=5) - (5 if learning_barrier_flag else 0)))

            # Generate marks for the term
            mark_noise = np.random.normal(loc=0, scale=4)
            mark = base_avg + subject_offset + term_trend + mark_noise
            # Make attendance impact marks if it's low
            if attendance_perc < 80:
                mark -= (80 - attendance_perc) * 0.2
            
            mark = int(max(30, min(100, mark))) # Clamp marks between 30 and 100

            # Generate teacher notes
            notes = []
            if mark < 50 or attendance_perc < 85:
                notes.append(random.choice(NEEDS_SUPPORT_NOTES))
            elif mark > 85:
                notes.append(random.choice(POSITIVE_NOTES))
            else:
                notes.append(random.choice(NEUTRAL_NOTES))
            
            # Add a second random note sometimes
            if random.random() > 0.6:
                notes.append(random.choice(NEUTRAL_NOTES + NEEDS_SUPPORT_NOTES))

            learner_data.append({
                'LearnerID': learner_id,
                'Grade': grade,
                'SocioEconomicIndicator': socio_economic_indicator,
                'LearningBarrier': learning_barrier_flag,
                'Subject': subject,
                'Term': term,
                'Mark': mark,
                'Attendance': round(attendance_perc, 2),
                'TeacherNotes': ' '.join(notes)
            })

# --- Create DataFrame and Export ---
df = pd.DataFrame(learner_data)

# Export to CSV
df.to_csv('christel_house_mock_data.csv', index=False)
print("Generated christel_house_mock_data.csv")

# Export to JSON (for p5.js)
df.to_json('christel_house_mock_data.json', orient='records')
print("Generated christel_house_mock_data.json")

print("\n--- Data Head ---")
print(df.head())