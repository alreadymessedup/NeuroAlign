import json
import matplotlib.pyplot as plt

def visualize_data(file_path):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        return

    timeline = data['timeline']
    timestamps = [frame['timestamp'] for frame in timeline]
    gaze_targets = [frame['gaze_target'] for frame in timeline]
    
    # Color mapping
    colors = {'Stimulus': 'blue', 'Void': 'gray', 'Caregiver': 'green'}
    chart_colors = [colors.get(g, 'black') for g in gaze_targets]

    plt.figure(figsize=(10, 4))
    
    # Scatter plot to show discrete gaze states
    # Mapping Categories to Y-axis values for plotting
    y_mapping = {'Void': 0, 'Stimulus': 1, 'Caregiver': 2}
    y_values = [y_mapping[g] for g in gaze_targets]
    
    plt.step(timestamps, y_values, where='post', color='gray', alpha=0.3)
    plt.scatter(timestamps, y_values, c=chart_colors, s=50, label='Gaze Point')
    
    # Hand Flapping Highlight
    flapping_periods = []
    start = None
    for frame in timeline:
        if frame['hand_flapping_detected'] and start is None:
            start = frame['timestamp']
        elif not frame['hand_flapping_detected'] and start is not None:
            flapping_periods.append((start, frame['timestamp']))
            start = None
    if start is not None:
        flapping_periods.append((start, timeline[-1]['timestamp']))

    for start, end in flapping_periods:
        plt.axvspan(start, end, color='red', alpha=0.2, label='Hand Flapping')

    plt.yticks([0, 1, 2], ['Void', 'Stimulus', 'Caregiver'])
    plt.xlabel('Time (s)')
    plt.title(f"Gaze Target Over Time (Risk Score: {data['summary_stats']['risk_score']})")
    
    # De-duplicate labels
    handles, labels = plt.gca().get_legend_handles_labels()
    by_label = dict(zip(labels, handles))
    plt.legend(by_label.values(), by_label.keys())
    
    plt.tight_layout()
    plt.savefig('data_visualization_output.png')
    print("Graph saved to data_visualization_output.png")
    plt.show()

if __name__ == "__main__":
    visualize_data('synthetic_screening_data.json')
