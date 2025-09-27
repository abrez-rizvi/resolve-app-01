import json
import pandas as pd
from datetime import datetime

def analyze_quittr_data(file_path='synthetic_data.json'):
    """
    Analyzes user event data from a JSON file to derive recovery insights.

    Args:
        file_path (str): The path to the JSON data file.

    Returns:
        dict: A dictionary containing various calculated insights.
    """
    # Load and normalize the JSON data into a pandas DataFrame
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Flatten the nested JSON structure into a table-like format
    df = pd.json_normalize(data['events'], sep='_')
    
    # --- Data Type Conversion and Feature Engineering ---
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour_of_day'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.day_name()
    df['is_resisted'] = (df['urge_outcome'] == 'resisted').astype(int)
    df['is_relapsed'] = (df['urge_outcome'] == 'relapsed').astype(int)

    insights = {}

    # --- 1. Event-Level Insights ---
    event_insights = {}
    total_urges = len(df)
    if total_urges > 0:
        event_insights['urge_outcome_rate'] = {
            'resisted_pct': df['is_resisted'].sum() / total_urges * 100,
            'relapsed_pct': df['is_relapsed'].sum() / total_urges * 100
        }

        # Calculate relapse probability for each feeling
        feeling_outcome = df.groupby('urge_feeling')['is_relapsed'].mean() * 100
        event_insights['feeling_to_outcome_correlation'] = feeling_outcome.to_dict()

        # Calculate Feeling Strength Index
        baseline_relapse_rate = df['is_relapsed'].mean()
        event_insights['feeling_strength_index'] = ((feeling_outcome / 100) / baseline_relapse_rate).to_dict()
        
    insights['event_level'] = event_insights

    # --- 2. Time-Based Insights ---
    time_insights = {}
    time_insights['peak_relapse_hours'] = df[df['is_relapsed'] == 1]['hour_of_day'].value_counts().nlargest(3).index.tolist()
    time_insights['peak_resistance_hours'] = df[df['is_resisted'] == 1]['hour_of_day'].value_counts().nlargest(3).index.tolist()
    
    # Day of week patterns
    time_insights['relapse_by_day_of_week'] = (df.groupby('day_of_week')['is_relapsed'].mean() * 100).sort_values(ascending=False).to_dict()

    # Recovery progress over time (resistance rate per month)
    df['month'] = df['timestamp'].dt.to_period('M')
    monthly_progress = df.groupby('month')['is_resisted'].mean() * 100
    time_insights['recovery_progress_over_time_pct'] = {str(k): v for k, v in monthly_progress.to_dict().items()}
    
    insights['time_based'] = time_insights

    # --- 3. Commitment & Consistency ---
    commitment_insights = {}
    # Commitment Score (30-day rolling average)
    df_sorted = df.sort_values('timestamp')
    # Set timestamp as index for rolling operation
    df_sorted_indexed = df_sorted.set_index('timestamp')
    commitment_insights['commitment_score_rolling_30d_avg'] = df_sorted_indexed['is_resisted'].rolling(window='30D').mean().iloc[-1] * 100 if not df_sorted_indexed.empty else 0

    relapse_timestamps = df_sorted[df_sorted['is_relapsed'] == 1]['timestamp']
    if len(relapse_timestamps) > 1:
        time_to_relapse = relapse_timestamps.diff().mean()
        commitment_insights['avg_time_to_relapse_hours'] = time_to_relapse.total_seconds() / 3600
    else:
        commitment_insights['avg_time_to_relapse_hours'] = None # Not enough data

    insights['commitment'] = commitment_insights

    # --- 4. Feeling Dynamics ---
    feeling_dynamics = {}
    if not df.empty:
        feeling_dynamics['most_vulnerable_feeling'] = df[df['is_relapsed'] == 1]['urge_feeling'].mode()[0]
        feeling_dynamics['most_protective_feeling'] = df[df['is_resisted'] == 1]['urge_feeling'].mode()[0]
    
    insights['feeling_dynamics'] = feeling_dynamics

    # --- 5 & 6. Predictive Patterns & User Feedback (Placeholders for ML models) ---
    # These sections would typically involve more complex machine learning models.
    # Here, we provide a simple example for a personalized risk profile.
    user_feedback = {}
    risk_profile = df.groupby(['urge_feeling', 'hour_of_day'])['is_relapsed'].mean().nlargest(1)
    if not risk_profile.empty:
        feeling, hour = risk_profile.index[0]
        risk_pct = risk_profile.iloc[0] * 100
        user_feedback['personalized_risk_profile'] = f"You’re most at risk ({risk_pct:.0f}%) of relapsing when feeling '{feeling}' during hour {hour}."
    
    insights['user_feedback_loops'] = user_feedback
    
    return insights

if __name__ == '__main__':
    # Make sure you have a 'synthetic_data.json' file in the same directory
    try:
        all_insights = analyze_quittr_data('synthetic_data.json')
        # Pretty print the results
        import json
        print(json.dumps(all_insights, indent=2))
    except FileNotFoundError:
        print("Error: 'synthetic_data.json' not found. Please generate the data first.")