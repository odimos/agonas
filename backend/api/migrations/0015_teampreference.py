from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_remove_stadiumavailability_end_time'),
    ]

    operations = [
        migrations.CreateModel(
            name='TeamPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.PositiveSmallIntegerField(default=0)),
                ('availability', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='preferences', to='api.stadiumavailability')),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='preferences', to='api.team')),
            ],
            options={
                'unique_together': {('team', 'availability')},
            },
        ),
    ]
