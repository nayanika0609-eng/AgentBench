import matplotlib.pyplot as plt
import tempfile


class ChartGenerator:

    @staticmethod
    def create_bar_chart(title, labels, values, ylabel):

        fig, ax = plt.subplots(figsize=(7,4))

        bars = ax.bar(labels, values)

        ax.set_title(title)

        ax.set_ylabel(ylabel)

        ax.bar_label(bars, padding=3)

        plt.tight_layout()

        file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".png"
        )

        plt.savefig(file.name, dpi=200)

        plt.close(fig)

        return file.name