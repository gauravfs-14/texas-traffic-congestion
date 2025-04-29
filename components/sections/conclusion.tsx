export default function Conclusion() {
  return (
    <section className="section bg-muted/20">
      <div className="section-title">Looking Ahead</div>
      <div className="section-subtitle">
        Strategies and solutions for addressing Texas's traffic congestion
        challenges
      </div>

      <div className="narrative-text">
        <p className="mb-6">
          As Texas continues to grow in population and economic activity,
          traffic congestion will remain a significant challenge. However,
          data-driven approaches can help identify effective solutions and
          prioritize investments in transportation infrastructure.
        </p>

        <h3 className="text-2xl font-bold mb-4">Potential Solutions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h4 className="text-xl font-bold mb-2">
              Infrastructure Improvements
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Targeted expansion of high-congestion corridors</li>
              <li>Improved interchange designs at bottleneck locations</li>
              <li>Development of parallel routes to distribute traffic</li>
              <li>Enhanced public transportation options</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h4 className="text-xl font-bold mb-2">Technology Solutions</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Advanced traffic management systems</li>
              <li>Real-time traffic information for drivers</li>
              <li>Adaptive signal timing at intersections</li>
              <li>Connected vehicle technologies</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h4 className="text-xl font-bold mb-2">Policy Approaches</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Incentives for carpooling and alternative transportation</li>
              <li>Flexible work schedules and remote work options</li>
              <li>Land use planning that reduces travel distances</li>
              <li>Congestion pricing in heavily impacted areas</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h4 className="text-xl font-bold mb-2">Behavioral Changes</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Increased adoption of public transit</li>
              <li>Shift to active transportation for short trips</li>
              <li>Off-peak travel when possible</li>
              <li>Reduced non-essential trips during peak hours</li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4">The Role of Data</h3>

        <p className="mb-6">
          Continued data collection and analysis will be essential for
          understanding congestion patterns and evaluating the effectiveness of
          various interventions. By leveraging advanced analytics and artificial
          intelligence, transportation agencies can develop more targeted and
          cost-effective solutions.
        </p>

        <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 mb-8">
          <h4 className="text-xl font-bold mb-2">About This Project</h4>
          <p>
            This data narrative was developed by the Artificial Intelligence in
            Transportation (AIT) Lab to demonstrate how data visualization and
            storytelling can help communicate complex transportation issues to
            the public and policymakers. The analysis is based on data from the
            Texas Department of Transportation's Top 100 Congested Roadways
            dataset.
          </p>
        </div>
      </div>
    </section>
  );
}
