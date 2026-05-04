
import React from 'react';
import { X, BookOpen, Target, Settings, BarChart3, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const content = {
    es: {
      title: "Manual de Uso: Montecarlo Food Risk",
      sections: [
        {
          id: "purpose",
          title: "1. Propósito y Objetivo",
          icon: <Target className="w-5 h-5 text-blue-500" />,
          content: (
            <div className="space-y-2">
              <p>Herramienta digital para realizar análisis probabilísticos de exposición dietética a contaminantes químicos específicos.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Modelado probabilístico de concentraciones y consumos.</li>
                <li>Cálculo de exposición dietética total.</li>
                <li>Comparación con valores de referencia (IDA/ADI).</li>
                <li>Visualización de resultados estadísticos y caracterización de riesgo.</li>
              </ul>
            </div>
          )
        },
        {
          id: "setup",
          title: "2. Configuración de Simulaciones",
          icon: <Settings className="w-5 h-5 text-purple-500" />,
          content: (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm">Paso 1: Parámetros Generales</h4>
                <p>Defina el contaminante, su Valor de Referencia (IDA/ADI), el peso corporal de la población y la intensidad del cálculo:</p>
                <ul className="list-disc pl-5 text-xs mt-1">
                  <li><strong>Peso Corporal:</strong> Puede ser un valor fijo (determinístico) o una distribución (probabilístico) si se conoce la variabilidad de la población.</li>
                  <li><strong>Iteraciones:</strong> Número de muestras por simulación (se recomiendan 10,000).</li>
                  <li><strong>Simulaciones:</strong> Número de veces que se repite el proceso completo para evaluar la estabilidad de los resultados.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm">Paso 2: Gestión de Alimentos</h4>
                <p>Añada alimentos de la lista predefinida o cree personalizados. Puede <strong>editar</strong> elementos existentes haciendo clic en el icono del lápiz o eliminarlos. Además, puede:</p>
                <ul className="list-disc pl-5 text-xs mt-1">
                  <li><strong>Concentración y Consumo:</strong> Defina si son valores fijos o distribuciones (Triangular, Normal, Log-Normal, etc.).</li>
                  <li><strong>Factor de Reducción:</strong> (Opcional) Permite modelar la pérdida del químico durante procesos como el lavado, pelado o cocinado.</li>
                  <li><strong>Persistencia de Datos:</strong> Use los botones de <strong>Guardar/Cargar JSON</strong> en la cabecera de la tabla para exportar su lista de alimentos y volver a usarla en el futuro.</li>
                </ul>
              </div>
              <p className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                <strong>Modo Experto:</strong> Habilítelo para configurar correlaciones, parámetros técnicos como <strong>LOD/LOQ</strong> (manejo de datos censurados ND=0, LOD/2 o LOD) y <strong>Factores de Procesamiento</strong> (multiplicadores de concentración).
              </p>
            </div>
          )
        },
        {
          id: "results",
          title: "3. Interpretación de Resultados",
          icon: <Info className="w-5 h-5 text-orange-500" />,
          content: (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm">Percentil 95 (P95):</h4>
                <p>Representa el escenario de "alto consumidor". Si el P95 supera el 100% de la IDA, indica un riesgo potencial para los consumidores más expuestos.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-xs">Cociente de Peligro (HQ):</h4>
                  <p className="text-[10px]">Relación entre la exposición P95 y el valor de referencia. Valore &gt; 1 indican riesgo.</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs">Margen de Seguridad (MoS):</h4>
                  <p className="text-[10px]">Inverso del riesgo. Valores &lt; 1 sugieren que el margen es insuficiente.</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm">POET (Probabilidad de Excedencia):</h4>
                <p>Es el porcentaje total de la población simulada que supera el umbral de seguridad. Un POET &gt; 5% suele requerir medidas de gestión de riesgo.</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <h4 className="font-bold text-sm mb-2">Niveles de Riesgo:</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="inline-block w-3 h-3 bg-muy-bajo rounded-full mr-2"></span><strong>Muy Bajo (&lt;25%):</strong> Seguro.</p>
                  <p><span className="inline-block w-3 h-3 bg-bajo rounded-full mr-2"></span><strong>Bajo (25-75%):</strong> Margen amplio.</p>
                  <p><span className="inline-block w-3 h-3 bg-moderado rounded-full mr-2"></span><strong>Moderado (75-100%):</strong> Zona límite.</p>
                  <p><span className="inline-block w-3 h-3 bg-alto rounded-full mr-2"></span><strong>Alto (&gt;100%):</strong> Riesgo potencial.</p>
                </div>
              </div>
            </div>
          )
        },
        {
          id: "comparison",
          title: "4. Herramienta de Comparación",
          icon: <BarChart3 className="w-5 h-5 text-green-500" />,
          content: (
            <div className="space-y-2">
              <p>La vista de <strong>"Comparación"</strong> en el panel de resultados permite contrastar visualmente:</p>
              <ul className="list-disc pl-5 text-xs space-y-1">
                <li><strong>Valor de Referencia:</strong> El límite máximo seguro (100%).</li>
                <li><strong>Riesgo Medio:</strong> La exposición promedio de la población.</li>
                <li><strong>Riesgo P95:</strong> La exposición del percentil 95.</li>
              </ul>
              <p className="text-xs">Esta gráfica es fundamental para decidir si las medidas deben enfocarse en la población general (si la media es alta) o en grupos específicos (si solo el P95 es alto).</p>
            </div>
          )
        },
        {
          id: "troubleshooting",
          title: "5. Solución de Problemas",
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          content: (
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li><strong>No se puede calcular:</strong> Verifique campos obligatorios y que haya al menos un alimento.</li>
              <li><strong>Resultados inesperados:</strong> Revise unidades (mg vs μg) y el valor de ADI.</li>
              <li><strong>Cálculo lento:</strong> Reduzca el número de iteraciones o elimine alimentos no esenciales.</li>
            </ul>
          )
        }
      ]
    },
    en: {
      title: "User Manual: Montecarlo Food Risk",
      sections: [
        {
          id: "purpose",
          title: "1. Purpose and Objective",
          icon: <Target className="w-5 h-5 text-blue-500" />,
          content: (
            <div className="space-y-2">
              <p>Digital tool for probabilistic analysis of dietary exposure to specific chemical contaminants.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Probabilistic modeling of concentrations and consumption.</li>
                <li>Calculation of total dietary exposure.</li>
                <li>Comparison with reference values (ADI).</li>
                <li>Visualization of statistical results and risk characterization.</li>
              </ul>
            </div>
          )
        },
        {
          id: "setup",
          title: "2. Simulation Setup",
          icon: <Settings className="w-5 h-5 text-purple-500" />,
          content: (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm">Step 1: General Parameters</h4>
                <p>Define the contaminant, its Reference Value (ADI), the population's body weight, and the calculation intensity:</p>
                <ul className="list-disc pl-5 text-xs mt-1">
                  <li><strong>Body Weight:</strong> Can be a fixed value (deterministic) or a distribution (probabilistic) if population variability is known.</li>
                  <li><strong>Iterations:</strong> Number of samples per simulation (10,000 recommended).</li>
                  <li><strong>Simulations:</strong> Number of times the entire process is repeated to evaluate result stability.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm">Step 2: Food Management</h4>
                <p>Add foods from the predefined list or create custom ones. You can <strong>edit</strong> existing items by clicking the pencil icon or delete them. Additionally:</p>
                <ul className="list-disc pl-5 text-xs mt-1">
                  <li><strong>Concentration & Consumption:</strong> Define if they are fixed values or distributions (Triangular, Normal, Log-Normal, etc.).</li>
                  <li><strong>Reduction Factor:</strong> (Optional) Models chemical loss during processes like washing, peeling, or cooking.</li>
                  <li><strong>Data Persistence:</strong> Use the <strong>Save/Load JSON</strong> buttons in the table header to export your food list and reuse it in the future.</li>
                </ul>
              </div>
              <p className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                <strong>Expert Mode:</strong> Enable it to configure correlations, technical parameters like <strong>LOD/LOQ</strong> (censored data handling ND=0, LOD/2 or LOD) and <strong>Processing Factors</strong> (concentration multipliers).
              </p>
            </div>
          )
        },
        {
          id: "results",
          title: "3. Interpretation of Results",
          icon: <Info className="w-5 h-5 text-orange-500" />,
          content: (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm">95th Percentile (P95):</h4>
                <p>Represents the "high consumer" scenario. If P95 exceeds 100% of the ADI, it indicates a potential risk for the most exposed consumers.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-xs">Hazard Quotient (HQ):</h4>
                  <p className="text-[10px]">Ratio between P95 exposure and the reference value. Values &gt; 1 indicate risk.</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs">Margin of Safety (MoS):</h4>
                  <p className="text-[10px]">Inverse of risk. Values &lt; 1 suggest an insufficient margin.</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm">POET (Probability of Exceedance):</h4>
                <p>The total percentage of the simulated population exceeding the safety threshold. A POET &gt; 5% usually requires risk management measures.</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <h4 className="font-bold text-sm mb-2">Risk Levels:</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="inline-block w-3 h-3 bg-muy-bajo rounded-full mr-2"></span><strong>Very Low (&lt;25%):</strong> Safe.</p>
                  <p><span className="inline-block w-3 h-3 bg-bajo rounded-full mr-2"></span><strong>Low (25-75%):</strong> Wide margin.</p>
                  <p><span className="inline-block w-3 h-3 bg-moderado rounded-full mr-2"></span><strong>Moderate (75-100%):</strong> Limit zone.</p>
                  <p><span className="inline-block w-3 h-3 bg-alto rounded-full mr-2"></span><strong>High (&gt;100%):</strong> Potential risk.</p>
                </div>
              </div>
            </div>
          )
        },
        {
          id: "comparison",
          title: "4. Comparison Tool",
          icon: <BarChart3 className="w-5 h-5 text-green-500" />,
          content: (
            <div className="space-y-2">
              <p>The <strong>"Comparison"</strong> view in the results panel allows you to visually contrast:</p>
              <ul className="list-disc pl-5 text-xs space-y-1">
                <li><strong>Reference Value:</strong> The maximum safe limit (100%).</li>
                <li><strong>Mean Risk:</strong> The average exposure of the population.</li>
                <li><strong>P95 Risk:</strong> The exposure of the 95th percentile.</li>
              </ul>
              <p className="text-xs">This chart is essential for deciding whether measures should focus on the general population (if the mean is high) or specific groups (if only P95 is high).</p>
            </div>
          )
        },
        {
          id: "troubleshooting",
          title: "5. Troubleshooting",
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          content: (
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li><strong>Cannot calculate:</strong> Check mandatory fields and ensure at least one food is added.</li>
              <li><strong>Unexpected results:</strong> Check units (mg vs μg) and the ADI value.</li>
              <li><strong>Slow calculation:</strong> Reduce iterations or remove non-essential foods.</li>
            </ul>
          )
        }
      ]
    },
    fr: {
      title: "Manuel d'Utilisation : Montecarlo Food Risk",
      sections: [
        {
          id: "purpose",
          title: "1. But et Objectif",
          icon: <Target className="w-5 h-5 text-blue-500" />,
          content: (
            <div className="space-y-2">
              <p>Outil numérique pour l'analyse probabiliste de l'exposition alimentaire à des contaminants chimiques spécifiques.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Modélisation probabiliste des concentrations et de la consommation.</li>
                <li>Calcul de l'exposition alimentaire totale.</li>
                <li>Comparaison avec les valeurs de référence (DJA).</li>
                <li>Visualisation des résultats statistiques et caractérisation des risques.</li>
              </ul>
            </div>
          )
        },
        {
          id: "setup",
          title: "2. Configuration des Simulations",
          icon: <Settings className="w-5 h-5 text-purple-500" />,
          content: (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm">Étape 1 : Paramètres Généraux</h4>
                <p>Définissez le contaminant, sa Valeur de Référence (DJA/ADI), le poids corporel de la population et l'intensité du calcul :</p>
                <ul className="list-disc pl-5 text-xs mt-1">
                  <li><strong>Poids Corporel :</strong> Peut être une valeur fixe (déterministe) ou une distribution (probabiliste) si la variabilité de la population est connue.</li>
                  <li><strong>Itérations :</strong> Nombre d'échantillons par simulation (10 000 recommandés).</li>
                  <li><strong>Simulations :</strong> Nombre de fois que le processus complet est répété pour évaluer la stabilité des résultats.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm">Étape 2 : Gestion des Aliments</h4>
                <p>Ajoutez des aliments de la liste prédéfinie ou créez-en des personnalizados. Vous pouvez <strong>modifier</strong> les éléments existants en cliquant sur l'icône du crayon ou les supprimer. De plus :</p>
                <ul className="list-disc pl-5 text-xs mt-1">
                  <li><strong>Concentration et Consommation :</strong> Définissez s'il s'agit de valeurs fixes ou de distributions (Triangulaire, Normale, Log-Normale, etc.).</li>
                  <li><strong>Facteur de Réduction :</strong> (Optionnel) Modélise la perte de produit chimique lors de processus comme le lavage, l'épluchage ou la cuisson.</li>
                  <li><strong>Persistance des Données :</strong> Utilisez les boutons <strong>Enregistrer/Charger JSON</strong> dans l'en-tête du tableau pour exporter votre liste d'aliments.</li>
                </ul>
              </div>
              <p className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                <strong>Mode Expert :</strong> Activez-le pour configurer les corrélations, les paramètres techniques comme <strong>LOD/LOQ</strong> (gestion des données censurées ND=0, LOD/2 ou LOD) et les <strong>Facteurs de Transformation</strong> (multiplicateurs de concentration).
              </p>
            </div>
          )
        },
        {
          id: "results",
          title: "3. Interprétation des Résultats",
          icon: <Info className="w-5 h-5 text-orange-500" />,
          content: (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm">95e Percentile (P95) :</h4>
                <p>Représente le scénario du "gros consommateur". Si le P95 dépasse 100 % de la DJA, cela indique un risque potentiel pour les consommateurs les plus exposés.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-xs">Quotient de Danger (HQ) :</h4>
                  <p className="text-[10px]">Rapport entre l'exposition P95 et la valeur de référence. Les valeurs &gt; 1 indiquent un risque.</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs">Marge de Sécurité (MoS) :</h4>
                  <p className="text-[10px]">Inverse du risque. Les valeurs &lt; 1 suggèrent une marge insuffisante.</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm">POET (Probabilité de Dépassement) :</h4>
                <p>Il s'agit du pourcentage total de la population simulée qui dépasse le seuil de sécurité. Un POET &gt; 5 % nécessite généralement des mesures de gestion des risques.</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <h4 className="font-bold text-sm mb-2">Niveaux de Risque :</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="inline-block w-3 h-3 bg-muy-bajo rounded-full mr-2"></span><strong>Très Bas (&lt;25 %) :</strong> Sûr.</p>
                  <p><span className="inline-block w-3 h-3 bg-bajo rounded-full mr-2"></span><strong>Bas (25-75 %) :</strong> Marge large.</p>
                  <p><span className="inline-block w-3 h-3 bg-moderado rounded-full mr-2"></span><strong>Modéré (75-100 %) :</strong> Zone limite.</p>
                  <p><span className="inline-block w-3 h-3 bg-alto rounded-full mr-2"></span><strong>Haut (&gt;100 %) :</strong> Risque potentiel.</p>
                </div>
              </div>
            </div>
          )
        },
        {
          id: "comparison",
          title: "4. Outil de Comparaison",
          icon: <BarChart3 className="w-5 h-5 text-green-500" />,
          content: (
            <div className="space-y-2">
              <p>La vue <strong>"Comparaison"</strong> dans le panneau de résultats permet de contraster visuellement :</p>
              <ul className="list-disc pl-5 text-xs space-y-1">
                <li><strong>Valeur de Référence :</strong> La limite de sécurité maximale (100 %).</li>
                <li><strong>Risque Moyen :</strong> L'exposition moyenne de la population.</li>
                <li><strong>Risque P95 :</strong> L'exposition du 95e percentile.</li>
              </ul>
              <p className="text-xs">Ce graphique est essentiel pour décider si les mesures doivent se concentrer sur la population générale (si la moyenne est élevée) ou sur des groupes spécifiques (si seul le P95 est élevé).</p>
            </div>
          )
        },
        {
          id: "troubleshooting",
          title: "5. Dépannage",
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          content: (
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li><strong>Impossible de calculer :</strong> Vérifiez les champs obligatoires et assurez-vous qu'au moins un aliment est ajouté.</li>
              <li><strong>Résultats inattendus :</strong> Vérifiez les unités (mg vs μg) et la valeur DJA.</li>
              <li><strong>Calcul lent :</strong> Réduisez les itérations ou supprimez les aliments non essentiels.</li>
            </ul>
          )
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold">{currentContent.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {currentContent.sections.map((section) => (
            <section key={section.id} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-700">
                {section.icon}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{section.title}</h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {section.content}
              </div>
            </section>
          ))}
          
          <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-2 text-xs text-gray-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Montecarlo FoodRisk v2.0 - 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
