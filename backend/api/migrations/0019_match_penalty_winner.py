from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_team_photo'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='penalty_winner',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='penalty_wins',
                to='api.team',
            ),
        ),
    ]
