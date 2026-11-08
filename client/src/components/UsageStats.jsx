function UsageStats({ metrics }) {
return ( <section className="usage-stats"> <div className="stats-heading"> <h2>Execution Metrics</h2> <span>Last request</span> </div>


  <div className="stats-grid">
    <div className="stat-card">
      <span className="stat-label">AI MODEL</span>
      <h3>{metrics.model}</h3>
      <span className="stat-description">Model used for this request</span>
    </div>

    <div className="stat-card">
      <span className="stat-label">RESPONSE TIME</span>
      <h3>
        {metrics.responseTime === "--"
          ? "--"
          : `${metrics.responseTime} ms`}
      </h3>
      <span className="stat-description">Processing duration</span>
    </div>

    <div className="stat-card">
      <span className="stat-label">TOKENS USED</span>
      <h3>{metrics.tokens}</h3>
      <span className="stat-description">Input + output tokens</span>
    </div>

    <div className="stat-card">
      <span className="stat-label">EXECUTION MODE</span>
      <h3>{metrics.mode?.toUpperCase() || "--"}</h3>
      <span className="stat-description">Mode used for this request</span>
    </div>
  </div>
</section>


);
}

export default UsageStats;
