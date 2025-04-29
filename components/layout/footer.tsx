import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-playfair font-bold text-xl mb-4">AIT Lab</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              The Artificial Intelligence in Transportation Lab explores
              data-driven solutions for modern transportation challenges.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-base mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://www.txdot.gov/projects/planning/congestion.html"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                >
                  Data Methodology
                </Link>
              </li>
              <li>
                <Link
                  href="https://gis-txdot.opendata.arcgis.com/"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                >
                  TxDOT Open Data
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.txdot.gov/about/publications.html"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                >
                  Research Papers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-base mb-4">Data Sources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Top_100_Congested_Roadways/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                >
                  TxDOT Top 100 Congested Roadways API
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.txdot.gov/"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                >
                  Texas Department of Transportation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground mb-2">
            Developed by{" "}
            <Link
              href="https://gaurabchhetri.com.np"
              className="text-primary hover:underline"
              target="_blank"
            >
              Gaurab Chhetri
            </Link>{" "}
            | Supported by{" "}
            <Link
              href="https://ait-lab.vercel.app"
              className="text-primary hover:underline"
              target="_blank"
            >
              AIT Lab
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Artificial Intelligence in
            Transportation Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
