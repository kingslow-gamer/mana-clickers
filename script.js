    function formatLoadingRemaining(msRemaining) {
        const totalSec = Math.max(0, Math.floor(msRemaining / 1000));
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;

        if (days >= 1) {
            return `${days}d ${hours}h`;
        } else if (hours >= 1) {
            return `${hours}h ${mins}m`;
        } else {
            return 'Loading...';
        }
    }
